// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "lib/chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "lib/chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract Roulette is VRFConsumerBaseV2Plus, ReentrancyGuard {
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords, uint256 winningNumber);
    // Bet event
    event BetPlaced(uint256 indexed requestId, address player);
    event WinAmountCalculated(uint256 totalWinAmount);

    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256[] randomWords;
        uint256 winningNumber; // new field to store the mapped random number
    }
    mapping(uint256 => RequestStatus) public s_requests; /* requestId --> requestStatus */

    // Your subscription ID.
    uint256 public s_subscriptionId;

    // Min and Max bet
    uint256 constant MIN_BET_AMOUNT = 5e17; // 0.5 POL
    uint256 constant MAX_SINGLE_BET_AMOUNT = 10e18; // 10 POL
    uint256 constant MAX_TOTAL_BET_AMOUNT = 100e18; // 100 POL
    //  What am I betting on
    enum BetType {
        Number,
        Red,
        Black,
        Even,
        Odd,
        Low,
        High
    }
    // Bet
    struct SingleBet {
        BetType betType;
        uint256[] numbers; // Applicable for Number bets
        uint256 amount;
    }
    // Total Bet
    struct PlayerBet {
        SingleBet[] bets;
        address payable player;
        bool settled;
        uint256 winAmount;
    }
    // Map requestId to PlayerBet
    mapping(uint256 => PlayerBet) public bets;

    // Past request IDs.
    uint256[] public requestIds;
    uint256 public lastRequestId;

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf/v2-5/supported-networks
    bytes32 public keyHash =
        0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 100,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 public callbackGasLimit = 250000;

    // The default is 3, but you can set this higher.
    uint16 public requestConfirmations = 3;

    // For this example, retrieve 1 random value in one request.
    uint32 public numWords = 1;

    /**
     * HARDCODED FOR AMOY
     * COORDINATOR: 0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2
     */
    constructor(uint256 subscriptionId)
        VRFConsumerBaseV2Plus(0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2)
    {
        s_subscriptionId = subscriptionId;
    }

    // Assumes the subscription is funded sufficiently.
    // @param enableNativePayment: Set to `true` to enable payment in native tokens, or
    // `false` to pay in LINK
    function requestRandomWords() internal returns (uint256 requestId) {
        // Will revert if subscription is not set and funded.
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: true})
                )
            })
        );
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            winningNumber: 0,
            exists: true,
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] calldata _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;

        // Map the random number to a value between 0 and 36
        uint256 winningNumber = _randomWords[0] % 37;

        // Store the winningNumber in the s_requests mapping
        s_requests[_requestId].winningNumber = winningNumber;

        emit RequestFulfilled(_requestId, _randomWords, winningNumber);

        // Process the bet
        rienNeVaPlus(_requestId, _randomWords, winningNumber);
    }

    function getRequestStatus(uint256 _requestId)
        external
        view
        returns (
            bool fulfilled,
            uint256[] memory randomWords,
            uint256 winningNumber
        )
    {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords, request.winningNumber);
    }

    // BET FN

    function placeBet(SingleBet[] memory _bets) public payable nonReentrant {
        uint256 totalBetAmount = 0;

        // Validate and sum up bet amounts
        for (uint256 i = 0; i < _bets.length; i++) {
            require(
                _bets[i].amount == 5e17 || // 0.5 POL
                    _bets[i].amount == 1e18 || // 1 POL
                    _bets[i].amount == 5e18 || // 5 POL
                    _bets[i].amount == 10e18, // 10 POL
                "Invalid bet amount"
            );
            require(
                _bets[i].amount <= MAX_SINGLE_BET_AMOUNT,
                "Exceeds max single bet amount"
            );
            totalBetAmount += _bets[i].amount;
        }
        require(
            totalBetAmount <= MAX_TOTAL_BET_AMOUNT,
            "Exceeds max total bet amount"
        );

        // Request random words and get requestId
        uint256 betRequestId = requestRandomWords();

        // require(msg.value >= totalBetAmount + vrfFeeEstimate, "Insufficient POL sent");
        require(msg.value >= totalBetAmount, "Insufficient POL sent");

        // uint256 betRequestPrice;

        // Initialize the PlayerBet
        PlayerBet storage newBet = bets[betRequestId];
        newBet.player = payable(msg.sender);
        newBet.settled = false;
        newBet.winAmount = 0;

        // Manually copy each SingleBet and its numbers array
        for (uint256 i = 0; i < _bets.length; i++) {
            // Create a new SingleBet in storage
            SingleBet storage betToStore = newBet.bets.push();
            betToStore.betType = _bets[i].betType;
            betToStore.amount = _bets[i].amount;

            // Copy the numbers array
            for (uint256 j = 0; j < _bets[i].numbers.length; j++) {
                betToStore.numbers.push(_bets[i].numbers[j]);
            }
        }

        emit BetPlaced(betRequestId, msg.sender);

        // uint256 totalCost = totalBetAmount + betRequestPrice;
        uint256 totalCost = totalBetAmount;
        require(msg.value >= totalCost, "Insufficient POL sent");

        uint256 excess = msg.value - totalCost;
        if (excess > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: excess}("");
            require(refundSuccess, "Refund failed");
        }
    }

    function rienNeVaPlus(
        uint256 _requestId,
        uint256[] calldata _randomWords,
        uint256 _winningNumber
    ) internal {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        s_requests[_requestId].winningNumber = _winningNumber;

        PlayerBet storage playerBet = bets[_requestId];

        uint256 winAmount = calculateWin(playerBet.bets, _winningNumber);

        // Ensure the win amount does not exceed the contract's POL balance
        uint256 contractBalance = address(this).balance;
        if (winAmount > contractBalance) {
            winAmount = contractBalance;
        }

        // Transfer winnings to the player
        if (winAmount > 0) {
            (bool success, ) = playerBet.player.call{value: winAmount}("");
            require(success, "Transfer failed");
        }

        playerBet.winAmount = winAmount;
        playerBet.settled = true;

        // Optionally, clean up storage to save gas
        // delete bets[_requestId];
    }

    function calculateWin(SingleBet[] storage _bets, uint256 winningNumber)
        internal
        returns (uint256)
    {
        uint256 totalWinAmount = 0;

        for (uint256 i = 0; i < _bets.length; i++) {
            SingleBet storage bet = _bets[i];
            uint256 win = 0;

            if (bet.betType == BetType.Number) {
                // Straight bet on specific numbers
                for (uint256 j = 0; j < bet.numbers.length; j++) {
                    if (bet.numbers[j] == winningNumber) {
                        win += bet.amount * 35; // Payout is 35:1
                    }
                }
            } else if (bet.betType == BetType.Red) {
                if (isRed(winningNumber)) {
                    win += bet.amount * 2; // Payout is 1:1
                }
            } else if (bet.betType == BetType.Black) {
                if (isBlack(winningNumber)) {
                    win += bet.amount * 2; // Payout is 1:1
                }
            } else if (bet.betType == BetType.Even) {
                if (winningNumber != 0 && winningNumber % 2 == 0) {
                    win += bet.amount * 2; // Payout is 1:1
                }
            } else if (bet.betType == BetType.Odd) {
                if (winningNumber % 2 == 1) {
                    win += bet.amount * 2; // Payout is 1:1
                }
            } else if (bet.betType == BetType.Low) {
                if (winningNumber >= 1 && winningNumber <= 18) {
                    win += bet.amount * 2; // Payout is 1:1
                }
            } else if (bet.betType == BetType.High) {
                if (winningNumber >= 19 && winningNumber <= 36) {
                    win += bet.amount * 2; // Payout is 1:1
                }
            }

            totalWinAmount += win;
        }
        emit WinAmountCalculated(totalWinAmount);
        return totalWinAmount;
    }

    // END BET FN

    function isRed(uint256 number) internal pure returns (bool) {
        uint256[18] memory redNumbers = [
            uint256(1),
            uint256(3),
            uint256(5),
            uint256(7),
            uint256(9),
            uint256(12),
            uint256(14),
            uint256(16),
            uint256(18),
            uint256(19),
            uint256(21),
            uint256(23),
            uint256(25),
            uint256(27),
            uint256(30),
            uint256(32),
            uint256(34),
            uint256(36)
        ];
        for (uint256 i = 0; i < redNumbers.length; i++) {
            if (number == redNumbers[i]) {
                return true;
            }
        }
        return false;
    }

    function isBlack(uint256 number) internal pure returns (bool) {
        uint256[18] memory blackNumbers = [
            uint256(2),
            uint256(4),
            uint256(6),
            uint256(8),
            uint256(10),
            uint256(11),
            uint256(13),
            uint256(15),
            uint256(17),
            uint256(20),
            uint256(22),
            uint256(24),
            uint256(26),
            uint256(28),
            uint256(29),
            uint256(31),
            uint256(33),
            uint256(35)
        ];
        for (uint256 i = 0; i < blackNumbers.length; i++) {
            if (number == blackNumbers[i]) {
                return true;
            }
        }
        return false;
    }

    // Function to receive POL tokens
    receive() external payable {}

    // Function to withdraw POL tokens from the contract (if needed)
    function withdrawPOL(uint256 amount) external nonReentrant onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}

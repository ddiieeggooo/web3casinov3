// // SPDX-License-Identifier: UNLICENSED
// pragma solidity ^0.8.24;

// import "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
// import "lib/chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
// import "lib/chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
// import {Test, console} from "forge-std/Test.sol";
// import {Roulette} from "../src/Roulette.sol";

// contract RouletteTest is Test {
//     address owner = 0x474dC78aDb455D14d324b8563506f838104cE71c;
//     address addr1 = 0xF9a545874647d1bd7b2860462A8bFab19ffff6d3;
//     uint256 subscriptionId =
//         22351443111923144288214153211579656547712214928036604053579206498320868591108;
//     Roulette public _Roulette;

//     enum BetType {
//         Number,
//         Red,
//         Black,
//         Even,
//         Odd,
//         Low,
//         High
//     }

//     struct _SingleBet {
//         BetType betType;
//         uint256[] numbers; // Applicable for Number bets
//         uint256 amount;
//     }

//     function setUp() public {
//         vm.prank(owner);
//         _Roulette = new Roulette(subscriptionId);
//     }

//     function testBet() public {
//         _SingleBet memory bet = _SingleBet(BetType.Number, [1], 100);
//         _Roulette.placeBet(bet);
//         assertEq(_Roulette.bets[owner].length, 1);
//         assertEq(_Roulette.bets[owner][0].betType, bet.betType);
//         assertEq(_Roulette.bets[owner][0].numbers[0], bet.numbers[0]);
//         assertEq(_Roulette.bets[owner][0].amount, bet.amount);
//     }
// }

export const contractAddress='0x2Fe4633d8f91765D9a63669B20ace9322bD1687f';
export const contractAbi=[{"type":"constructor","inputs":[{"name":"subscriptionId","type":"uint256","internalType":"uint256"}],"stateMutability":"nonpayable"},{"type":"receive","stateMutability":"payable"},{"type":"function","name":"acceptOwnership","inputs":[],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"bets","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"player","type":"address","internalType":"address payable"},{"name":"settled","type":"bool","internalType":"bool"},{"name":"winAmount","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"callbackGasLimit","inputs":[],"outputs":[{"name":"","type":"uint32","internalType":"uint32"}],"stateMutability":"view"},{"type":"function","name":"getRequestStatus","inputs":[{"name":"_requestId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"fulfilled","type":"bool","internalType":"bool"},{"name":"randomWords","type":"uint256[]","internalType":"uint256[]"},{"name":"winningNumber","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"keyHash","inputs":[],"outputs":[{"name":"","type":"bytes32","internalType":"bytes32"}],"stateMutability":"view"},{"type":"function","name":"lastRequestId","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"numWords","inputs":[],"outputs":[{"name":"","type":"uint32","internalType":"uint32"}],"stateMutability":"view"},{"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"function","name":"placeBet","inputs":[{"name":"_bets","type":"tuple[]","internalType":"struct Roulette.SingleBet[]","components":[{"name":"betType","type":"uint8","internalType":"enum Roulette.BetType"},{"name":"numbers","type":"uint256[]","internalType":"uint256[]"},{"name":"amount","type":"uint256","internalType":"uint256"}]}],"outputs":[],"stateMutability":"payable"},{"type":"function","name":"rawFulfillRandomWords","inputs":[{"name":"requestId","type":"uint256","internalType":"uint256"},{"name":"randomWords","type":"uint256[]","internalType":"uint256[]"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"requestConfirmations","inputs":[],"outputs":[{"name":"","type":"uint16","internalType":"uint16"}],"stateMutability":"view"},{"type":"function","name":"requestIds","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"s_requests","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"fulfilled","type":"bool","internalType":"bool"},{"name":"exists","type":"bool","internalType":"bool"},{"name":"winningNumber","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"s_subscriptionId","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"s_vrfCoordinator","inputs":[],"outputs":[{"name":"","type":"address","internalType":"contract IVRFCoordinatorV2Plus"}],"stateMutability":"view"},{"type":"function","name":"setCoordinator","inputs":[{"name":"_vrfCoordinator","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"transferOwnership","inputs":[{"name":"to","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"withdrawPOL","inputs":[{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"event","name":"BetPlaced","inputs":[{"name":"requestId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"player","type":"address","indexed":false,"internalType":"address"}],"anonymous":false},{"type":"event","name":"CoordinatorSet","inputs":[{"name":"vrfCoordinator","type":"address","indexed":false,"internalType":"address"}],"anonymous":false},{"type":"event","name":"OwnershipTransferRequested","inputs":[{"name":"from","type":"address","indexed":true,"internalType":"address"},{"name":"to","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},{"type":"event","name":"OwnershipTransferred","inputs":[{"name":"from","type":"address","indexed":true,"internalType":"address"},{"name":"to","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},{"type":"event","name":"RequestFulfilled","inputs":[{"name":"requestId","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"randomWords","type":"uint256[]","indexed":false,"internalType":"uint256[]"}],"anonymous":false},{"type":"event","name":"RequestSent","inputs":[{"name":"requestId","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"numWords","type":"uint32","indexed":false,"internalType":"uint32"}],"anonymous":false},{"type":"error","name":"OnlyCoordinatorCanFulfill","inputs":[{"name":"have","type":"address","internalType":"address"},{"name":"want","type":"address","internalType":"address"}]},{"type":"error","name":"OnlyOwnerOrCoordinator","inputs":[{"name":"have","type":"address","internalType":"address"},{"name":"owner","type":"address","internalType":"address"},{"name":"coordinator","type":"address","internalType":"address"}]},{"type":"error","name":"ReentrancyGuardReentrantCall","inputs":[]},{"type":"error","name":"ZeroAddress","inputs":[]}];

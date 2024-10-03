  // const { address } = useAccount();
  // const [events, setEvents] = useState([]);

  // const getEvents = async() => {
  //   const frontendWinningNumber = await publicClient.getLogs({
  //     address: contractAddress,
  //     event: parseAbiItem('event RequestFulfilled(uint256 requestId, uint256[] randomWords, uint256 winninNumber)'),
  //     // du premier bloc
  //     fromBlock: 12724510n,
  //     // jusqu'au dernier
  //     toBlock: 'latest' // Pas besoin valeur par défaut
  //   })

  //   const frontendTotalWinAmount = await publicClient.getLogs({
  //     address: contractAddress,
  //     event: parseAbiItem('event WinAmountCalculated(uint256 totalWinAmount)'),
  //     // du premier bloc
  //     fromBlock: 12724510n,
  //     // jusqu'au dernier
  //     toBlock: 'latest' // Pas besoin valeur par défaut
  //   })

  //   const combinedEvents = frontendWinningNumber.map((event) => ({
  //     type: 'Winning Number',
  //     address: event.args.account,
  //     winningNumber: event.args.winningNumber,
  //     blockNumber: Number(event.blockNumber)
  //   })).concat(frontendTotalWinAmount.map((event) => ({
  //     type: 'Total Win Amount',
  //     address: event.args.account,
  //     totalWinAmount: event.args.totalWinAmount,
  //     blockNumber: Number(event.blockNumber)
  //   })))

  //   // sort by value
  //   combinedEvents.sort(function (a, b) {
  //     return b.blockNumber - a.blockNumber;
  //   });

  //   setEvents(combinedEvents)
  // }

  // useEffect(() => {
  //   const getAllEvents = async() => {
  //     if(address !== 'undefined') {
  //       await getEvents();
  //     }
  //   }
  //   getAllEvents();
  // }, [address])

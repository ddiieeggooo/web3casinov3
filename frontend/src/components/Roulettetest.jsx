const { address } = useAccount();
const [events, setEvents] = useState([])

// On récupère la balance ici
const { data: lastWinningNumber, error, isPending, refetch } = useReadContract({
  address: contractAddress,
  abi: contractAbi,
  functionName: 'getRequestStatus',
})

const getEvents = async() => {
  const depositEvents = await publicClient.getLogs({
    address: contractAddress,
    event: parseAbiItem('event etherDeposited(address indexed account, uint amount)'),
    // du premier bloc
    fromBlock: 0n,
    // jusqu'au dernier
    toBlock: 'latest' // Pas besoin valeur par défaut
  })

  const withdrawEvents = await publicClient.getLogs({
    address: contractAddress,
    event: parseAbiItem('event etherWithdrawed(address indexed account, uint amount)'),
    // du premier bloc
    fromBlock: 0n,
    // jusqu'au dernier
    toBlock: 'latest' // Pas besoin valeur par défaut
  })

  const combinedEvents = depositEvents.map((event) => ({
    type: 'Deposit',
    address: event.args.account,
    amount: event.args.amount,
    blockNumber: Number(event.blockNumber)
  })).concat(withdrawEvents.map((event) => ({
    type: 'Withdraw',
    address: event.args.account,
    amount: event.args.amount,
    blockNumber: Number(event.blockNumber)
  })))

  // sort by value
  combinedEvents.sort(function (a, b) {
    return b.blockNumber - a.blockNumber;
  });

  setEvents(combinedEvents)
}

useEffect(() => {
  const getAllEvents = async() => {
    if(address !== 'undefined') {
      await getEvents();
    }
  }
  getAllEvents();
}, [address])

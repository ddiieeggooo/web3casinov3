'use client';
import { useState, useEffect } from 'react';
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
  useReadContract,
  useBalance
} from 'wagmi';
import { contractAddress, contractAbi } from '../constants/index';
import { parseEther, parseAbiItem, formatEther } from 'viem';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { publicClient } from '@/utils/client';
import Head from 'next/head';
import Link from 'next/link';
import { waitForTransactionReceipt } from 'viem/actions';

// Read the smart contract balance
// const balanceOfSmartContract = await publicClient.getBalance({
//   address: '0xcF4fED48a393aCCa7c8C2508FF745d9602b62A4a',
// })

export default function Roulette() {
  const { address } = useAccount();
  const [betAmount, setBetAmount] = useState(0.5); // Default bet amount
  const [bets, setBets] = useState([]);
  const [resultWinningNumber, setResultWinningNumber] = useState([]);
  const [resultTotalWinAmount, setResultTotalWinAmount] = useState([]);

  const allowedBetAmounts = [0.5, 1, 5, 10];
  const redNumbers = [
    1, 3, 5, 7, 9, 12, 14, 16, 18,
    19, 21, 23, 25, 27, 30, 32, 34, 36,
  ];
  const blackNumbers = [
    2, 4, 6, 8, 10, 11, 13, 15, 17,
    20, 22, 24, 26, 28, 29, 31, 33, 35,
  ];

  const betTypeMapping = {
    Number: 0,
    Red: 1,
    Black: 2,
    Even: 3,
    Odd: 4,
    Low: 5,
    High: 6,
  };

  const betTypeStrings = {
    0: 'Number',
    1: 'Red',
    2: 'Black',
    3: 'Even',
    4: 'Odd',
    5: 'Low',
    6: 'High',
  };

  // Function to handle number button clicks
  function handleNumberClick(number) {
    const existingBetIndex = bets.findIndex(
      (bet) =>
        bet.betType === betTypeMapping.Number && bet.numbers[0] === number
    );
    const betAmountBigInt = parseEther(betAmount.toString());
    if (existingBetIndex !== -1) {
      const updatedBets = bets.map((bet, index) =>
        index === existingBetIndex
          ? { ...bet, amount: bet.amount + betAmountBigInt }
          : bet
      );
      setBets(updatedBets);
    } else {
      setBets([
        ...bets,
        {
          betType: betTypeMapping.Number,
          numbers: [number],
          amount: betAmountBigInt,
        },
      ]);
    }
  }

  // Function to handle option button clicks
  function handleOptionClick(option) {
    const betType = betTypeMapping[option];
    const existingBetIndex = bets.findIndex((bet) => bet.betType === betType);
    const betAmountBigInt = parseEther(betAmount.toString());
    if (existingBetIndex !== -1) {
      const updatedBets = bets.map((bet, index) =>
        index === existingBetIndex
          ? { ...bet, amount: bet.amount + betAmountBigInt }
          : bet
      );
      setBets(updatedBets);
    } else {
      setBets([
        ...bets,
        {
          betType,
          numbers: [],
          amount: betAmountBigInt,
        },
      ]);
    }
  }

  // Function to remove a bet
  function removeBet(index) {
    setBets(bets.filter((_, i) => i !== index));
  }

  // Calculate total bet amount
  const totalBetAmount = bets.reduce(
    (sum, bet) => sum + bet.amount,
    BigInt(0)
  );

  // Convert bets amounts to strings to avoid BigInt serialization issues
  const betsForContract = bets.map((bet) => ({
    betType: bet.betType,
    numbers: bet.numbers,
    amount: bet.amount.toString(),
  }));

  const totalBetAmountString = totalBetAmount.toString();

  // Set up useWriteContract hook
  const { data: writeData, isPending, writeContract } = useWriteContract({
    mutation: {
      onSuccess: () => {
        setBets([]);
        // Show a spinning roulette toast
        toast.info(
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <img
              src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXUxamVjbHg2Z2Vib2xjODh4NG1kN3pjMThuc2xlbXFyN25iMTVldSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xUn3CftPBajoflzROU/giphy-downsized-large.gif"
              alt="Spinning Roulette"
              style={{ width: '200px', height: '200px', marginRight: '10px', marginLeft: '16px' }} // Increased width
            />
            <span>Bet placed successfully ! See the result soon in the last spin section</span>
          </div>,
          {
            position: 'top-right',
            autoClose: 19000, // Duration set to 30 seconds
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
            style: {
              background: '#086b08', // Custom background color
              color: '#fff',      // Custom text color
            },
          }
        );
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`, {
          position: 'top-right',
        });
      },
    },
  });

  // Set up useWaitForTransactionReceipt hook
  const { data: receiptData, isLoading: isTxLoading } =
    useWaitForTransactionReceipt({
      hash: writeData?.hash,
    });

  // Fetch results
  const getResults = async () => {
    try {
      const frontendTotalWinAmount = await publicClient.getLogs({
        address: contractAddress,
        event: parseAbiItem(
          'event WinAmountCalculated(uint256 totalWinAmount)'
        ),
        fromBlock: 62758415n,
        toBlock: 'latest',
      });

      const frontendWinningNumber = await publicClient.getLogs({
        address: contractAddress,
        event: parseAbiItem(
          'event RequestFulfilled(uint256 requestId, uint256[] randomWords, uint256 winningNumber)'
        ),
        fromBlock: 62758415n,
        toBlock: 'latest',
      });

      setResultTotalWinAmount(frontendTotalWinAmount);
      setResultWinningNumber(frontendWinningNumber);
    } catch (error) {
      console.error('Error fetching results:', error);
      setResultTotalWinAmount([]);
      setResultWinningNumber([]);
    }
  };

  useEffect(() => {
    const getAllResults = async () => {
      if (resultWinningNumber && resultTotalWinAmount) {
        await getResults();
      }
    };
    getAllResults();
  }, [resultWinningNumber, resultTotalWinAmount]);

  // Async function to place bets
  async function placeBets() {
    if (!writeContract) {
      toast.error('Transaction is not ready', {
        position: 'top-right',
      });
      return;
    }
    try {
      await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'placeBet',
        args: [betsForContract],
        value: totalBetAmountString,
        account: address,
      });
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast.error(`Error sending transaction: ${error.message}`, {
        position: 'top-right',
      });
    }
  }

  // Define rows for the roulette table
  const row1 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]; // Top row
  const row2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]; // Middle row
  const row3 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]; // Bottom row

  // Read and update the smart contract balance
  const { data: balanceOfSmartContract, isError, isLoading } = useBalance({
    address: '0xcF4fED48a393aCCa7c8C2508FF745d9602b62A4a',
    watch: true, // Enables real-time updates
    // pollingInterval: 10000, // Polls every 10 seconds
  });

  return (
    <>
      <Head>
        {/* Importing fonts from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        {/* Import 'Pacifico' font for h1 */}
        {/* Import 'Open Sans' font for h2 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&family=Open+Sans&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="roulette-container">
        {/* Toast Container */}
        <ToastContainer />

        <h1>Roulette</h1>
        <h2>Make sure your potential gains are less than the total balance of the smart contract, otherwise you will not be paid for all of your winnings</h2>
        <h2>
      Current balance of the smart contract:{' '}
      {isLoading
        ? 'Loading...'
        : isError
        ? 'Error fetching balance'
        : `${formatEther(balanceOfSmartContract?.value || 0)} POL`}
    </h2>
        <h2>Select Bet Amount per Coin:</h2>
        <div className="bet-amount-buttons">
          {allowedBetAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setBetAmount(amount)}
              disabled={betAmount === amount}
              className={`bet-amount-button ${betAmount === amount ? 'selected' : ''
                }`}
            >
              {amount} POL
            </button>
          ))}
        </div>

        <h2>Select Numbers:</h2>
        <div className="roulette-table">
          <div className="roulette-row">
            {/* Zero on the left */}
            <button
              onClick={() => handleNumberClick(0)}
              className="number-button zero"
            >
              0
            </button>
            {/* Number grid */}
            <div className="number-rows">
              <div className="number-row">
                {row1.map((number) => (
                  <button
                    key={number}
                    onClick={() => handleNumberClick(number)}
                    className={`number-button ${redNumbers.includes(number) ? 'red' : 'black'
                      }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
              <div className="number-row">
                {row2.map((number) => (
                  <button
                    key={number}
                    onClick={() => handleNumberClick(number)}
                    className={`number-button ${redNumbers.includes(number) ? 'red' : 'black'
                      }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
              <div className="number-row">
                {row3.map((number) => (
                  <button
                    key={number}
                    onClick={() => handleNumberClick(number)}
                    className={`number-button ${redNumbers.includes(number) ? 'red' : 'black'
                      }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <h2>Other Bet Options:</h2>
        <div className="bet-options">
          {['Red', 'Black', 'Even', 'Odd', 'Low', 'High'].map((option) => (
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              className="option-button"
            >
              {option}
            </button>
          ))}
        </div>

        <h2>Bets Placed (maximum total bet : 100 POL):</h2>
        <ul className="bets-placed">
          {bets.map((bet, index) => (
            <li key={index} className="bet-item">
              {betTypeStrings[bet.betType]}{' '}
              {bet.numbers.length > 0 ? bet.numbers.join(', ') : ''} -{' '}
              {Number(bet.amount) / 1e18} POL{' '}
              <button
                onClick={() => removeBet(index)}
                className="remove-bet-button"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={placeBets}
          // disabled={isPending || isTxLoading}
          disabled={isPending}
          className="place-bets-button"
        >
          {/* {isPending || isTxLoading ? 'Placing Bets...' : 'Place Bets'} */}
          {isPending ? 'Placing Bets...' : 'Place Bets'}
        </button>

        <h2>Last Spin</h2>
        <div className="last-spin">
          <p>
            <strong>Winning Number :</strong>{' '}
            {resultWinningNumber && resultWinningNumber.length > 0
              ? resultWinningNumber[
                resultWinningNumber.length - 1
              ]?.args?.winningNumber.toString()
              : 'No spins yet'}
          </p>
          <p>
            <strong>Total Win Amount :</strong>{' '}
            {resultTotalWinAmount && resultTotalWinAmount.length > 0
              ? formatEther(
                resultTotalWinAmount[
                  resultTotalWinAmount.length - 1
                ]?.args?.totalWinAmount.toString()
              ) + ' POL'
              : 'No spins yet'}
          </p>
        </div>

        <h2>Spin History from last to first</h2>
        <div className="spin-history">
          {resultWinningNumber && resultWinningNumber.length > 0 ? (
            <table className="spin-history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Winning Number</th>
                  <th>Total Win Amount</th>
                </tr>
              </thead>
              <tbody>
                {resultWinningNumber
                  .slice()
                  .reverse()
                  .map((event, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{event?.args?.winningNumber?.toString() ?? 'N/A'}</td>
                      <td>
                        {resultTotalWinAmount[
                          resultTotalWinAmount.length - 1 - index
                        ]
                          ? formatEther(
                            resultTotalWinAmount[
                              resultTotalWinAmount.length - 1 - index
                            ]?.args?.totalWinAmount ?? '0'
                          ) + ' POL'
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p>No spin history available.</p>
          )}
        </div>
      </div>
      <style jsx>{`
        .roulette-container {
          padding: 20px;
          font-family: 'Open Sans', sans-serif;
          text-align: center;
          background-color: #2e2e2e;
          color: #fff;
          min-height: 100vh;
          width: 100%; /* Make the container full width */
        }
        h1 {
          font-family: 'Pacifico', cursive;
          font-size: 3em;
          color: #ffd700;
          margin-bottom: 20px;
        }
        h4 {
          font-family: 'Open Sans', sans-serif;
          font-size: 1.5em;
          color: #ffd700;
          margin-bottom: 20px;
        }
        h2 {
          font-family: 'Open Sans', sans-serif;
          font-size: 1.5em;
          color: #ffd700;
          margin-bottom: 10px;
        }
        .bet-amount-buttons {
          margin-bottom: 20px;
        }
        .bet-amount-button {
          margin: 5px;
          padding: 10px;
          background-color: #e7e7e7;
          color: black;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .bet-amount-button.selected {
          background-color: #4caf50;
          color: white;
        }
        .roulette-table {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
          width: 100%;
        }
        .roulette-row {
          display: flex;
        }
        .number-button.zero {
          background-color: green;
          width: 50px;
          height: 156px; /* Adjusted to match the combined height of three number buttons plus margins */
          border-radius: 5px;
          color: white;
          font-size: 1em;
          cursor: pointer;
          margin-right: 5px;
        }
        .number-rows {
          display: flex;
          flex-direction: column;
        }
        .number-row {
          display: flex;
          margin-bottom: 2px;
        }
        .number-button {
          width: 50px;
          height: 50px;
          margin: 1px;
          border: none;
          border-radius: 5px;
          color: white;
          font-size: 1em;
          cursor: pointer;
        }
        .number-button.red {
          background-color: red;
        }
        .number-button.black {
          background-color: black;
        }
        .bet-options {
          margin-bottom: 20px;
        }
        .option-button {
          margin: 5px;
          padding: 10px 20px;
          background-color: #e7e7e7;
          color: black;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .bets-placed {
          list-style: none;
          padding: 0;
          margin-bottom: 20px;
        }
        .bet-item {
          margin-bottom: 5px;
        }
        .remove-bet-button {
          margin-left: 10px;
          padding: 5px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .place-bets-button {
          margin-top: 20px;
          padding: 15px 30px;
          background-color: #ffd700;
          color: black;
          border: none;
          border-radius: 50%;
          font-size: 16px;
          cursor: pointer;
          width: 180px;
          height: 180px;
        }
        .place-bets-button:hover {
          transform: scale(1.05);
        }
        .last-spin {
          background-color: #333;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
          display: inline-block;
          text-align: left;
        }
        .spin-history {
          width: 80%;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 20px;
        }
        .spin-history-table {
          width: 100%;
          border-collapse: collapse;
        }
        .spin-history-table th,
        .spin-history-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }
        .spin-history-table th {
          background-color: #555;
          color: white;
        }
        .spin-history-table tr:nth-child(even) {
          background-color: #333;
        }
        .spin-history-table tr:hover {
          background-color: #444;
        }
      `}</style>
    </>
  );
}

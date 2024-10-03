'use client';
import { useState, useEffect } from 'react';
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { contractAddress, contractAbi } from '../constants/index';
import { parseEther } from 'viem';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ethers } from 'ethers';

export default function Roulette() {
  const { address } = useAccount();
  const [betAmount, setBetAmount] = useState(0.5); // Default bet amount
  const [bets, setBets] = useState([]);
  const [requestId, setRequestId] = useState(null);
  const [winningNumber, setWinningNumber] = useState(null);
  const [winAmount, setWinAmount] = useState(null);

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
      (bet) => bet.betType === betTypeMapping.Number && bet.numbers[0] === number
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
  const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, BigInt(0));

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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="https://i.imgur.com/7yUvePI.gif" // Example spinning roulette GIF
              alt="Spinning Roulette"
              style={{ width: '50px', marginRight: '10px' }}
            />
            <span>Bet placed successfully! Waiting for confirmation...</span>
          </div>,
          {
            position: "top-right",
            autoClose: false,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
          }
        );
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`, {
          position: "top-right",
        });
      },
    },
  });

  // Set up useWaitForTransactionReceipt hook
  const { data: receiptData, isLoading: isTxLoading } = useWaitForTransactionReceipt({
    hash: writeData?.hash,
  });

  // useEffect to process the transaction receipt
  useEffect(() => {
    const processReceipt = async () => {
      if (receiptData) {
        // Parse the receipt to get requestId from BetPlaced event
        const iface = new ethers.utils.Interface(contractAbi);
        let extractedRequestId = null;

        for (const log of receiptData.logs) {
          try {
            const parsedLog = iface.parseLog(log);
            if (parsedLog.name === 'BetPlaced') {
              extractedRequestId = parsedLog.args.requestId.toNumber();
              break;
            }
          } catch (error) {
            // Ignore logs that don't match
          }
        }

        if (extractedRequestId) {
          setRequestId(extractedRequestId);
          // Fetch the request status
          const status = await getRequestStatus(extractedRequestId);
          if (status) {
            setWinningNumber(status.winningNumber);
            setWinAmount(status.winAmount);

            // Show the winning number and win amount in a toast
            toast.dismiss(); // Dismiss the spinning roulette toast
            toast.success(
              <div>
                <h4>🎉 Transaction Confirmed! 🎉</h4>
                <p>Winning Number: <strong>{status.winningNumber}</strong></p>
                <p>Win Amount: <strong>{(status.winAmount / 1e18).toFixed(2)} POL</strong></p>
              </div>,
              {
                position: "top-right",
                autoClose: 5000,
              }
            );
          }
        } else {
          toast.dismiss();
          toast.error('Failed to retrieve requestId from transaction logs.', {
            position: "top-right",
          });
        }
      }
    };

    processReceipt();
  }, [receiptData]);

  // Function to read request status from the contract
  const getRequestStatus = async (requestId) => {
    try {
      const contract = new ethers.Contract(contractAddress, contractAbi);
      const status = await contract.getRequestStatus(requestId);
      return status;
    } catch (error) {
      console.error('Error fetching request status:', error);
      toast.error(`Error fetching request status: ${error.message}`, {
        position: "top-right",
      });
      return null;
    }
  };

  // Async function to place bets
  async function placeBets() {
    if (!writeContract) {
      toast.error('Transaction is not ready', {
        position: "top-right",
      });
      return;
    }
    try {
      await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'placeBet',
        args: [betsForContract],
        value: totalBetAmountString, // Correctly placed inside 'overrides'
        account: address,
      });
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast.error(`Error sending transaction: ${error.message}`, {
        position: "top-right",
      });
    }
  }

  // Kaomoji style representation
  const rouletteKaomoji = `( ͡° ͜ʖ ͡°)つ 🎲`;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Toast Container */}
      <ToastContainer />

      <h1>Roulette</h1>
      <pre style={{ fontSize: '24px' }}>{rouletteKaomoji}</pre>

      <h2>Select Bet Amount per Coin:</h2>
      <div style={{ marginBottom: '10px' }}>
        {allowedBetAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => setBetAmount(amount)}
            disabled={betAmount === amount}
            style={{
              margin: '5px',
              padding: '10px',
              backgroundColor: betAmount === amount ? '#4CAF50' : '#e7e7e7',
              color: betAmount === amount ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {amount} POL
          </button>
        ))}
      </div>

      <h2>Select Numbers:</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '400px' }}>
        {[...Array(37).keys()].map((number) => {
          const isRed = redNumbers.includes(number);
          const isBlack = blackNumbers.includes(number);
          const color = isRed ? 'red' : isBlack ? 'black' : 'green';
          return (
            <button
              key={number}
              onClick={() => handleNumberClick(number)}
              style={{
                color: 'white',
                backgroundColor: color,
                width: '40px',
                height: '40px',
                margin: '2px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              {number}
            </button>
          );
        })}
      </div>

      <h2>Other Bet Options:</h2>
      <div style={{ marginBottom: '10px' }}>
        {['Red', 'Black', 'Even', 'Odd', 'Low', 'High'].map((option) => (
          <button
            key={option}
            onClick={() => handleOptionClick(option)}
            style={{
              margin: '5px',
              padding: '10px',
              backgroundColor: '#e7e7e7',
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {option}
          </button>
        ))}
      </div>

      <h2>Bets Placed:</h2>
      <ul>
        {bets.map((bet, index) => (
          <li key={index} style={{ marginBottom: '5px' }}>
            {betTypeStrings[bet.betType]}{' '}
            {bet.numbers.length > 0 ? bet.numbers.join(', ') : ''} -{' '}
            {Number(bet.amount) / 1e18} POL{' '}
            <button
              onClick={() => removeBet(index)}
              style={{
                marginLeft: '10px',
                padding: '5px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={placeBets}
        disabled={isPending || isTxLoading}
        style={{
          marginTop: '20px',
          padding: '15px 30px',
          backgroundColor: '#008CBA',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        {isPending || isTxLoading ? 'Placing Bets...' : 'Place Bets'}
      </button>
    </div>
  );
}

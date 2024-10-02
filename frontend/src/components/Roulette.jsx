'use client';
import { useState } from 'react';
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { contractAddress, contractAbi } from '../constants/index';
import { parseEther } from 'viem';

export default function Roulette() {
  const { address } = useAccount();
  const [betAmount, setBetAmount] = useState(0.5); // Default bet amount
  const [bets, setBets] = useState([]);

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

  function removeBet(index) {
    setBets(bets.filter((_, i) => i !== index));
  }

  const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, BigInt(0));

  // Convert bets amounts to strings to avoid BigInt serialization issues
  const betsForContract = bets.map((bet) => ({
    betType: bet.betType,
    numbers: bet.numbers,
    amount: bet.amount.toString(),
  }));

  const totalBetAmountString = totalBetAmount.toString();

  const { data: hash, isPending, writeContract } = useWriteContract({
    mutation: {
      onSuccess: () => {
        setBets([]);
        alert('Bet placed successfully!');
      },
      onError: (error) => {
        alert(`Error: ${error.message}`);
      },
    },
  });

  const { isLoading: isTxLoading } = useWaitForTransactionReceipt({
    hash,
    onSuccess: () => {
      alert('Transaction confirmed!');
    },
    onError: (error) => {
      alert(`Transaction failed: ${error.message}`);
    },
  });

  function placeBets() {
    if (!writeContract) {
      alert('Transaction is not ready');
      return;
    }
    writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'placeBet',
      args: [betsForContract],
      value: totalBetAmountString,
      account: address,
    });
  }

  // Kaomoji style representation
  const rouletteKaomoji = `( ͡° ͜ʖ ͡°)つ 🎲`;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
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





















// 'use client';

// import { useState, useEffect } from "react";
// import { useAccount, useWriteContract,useWaitForTransactionReceipt } from "wagmi";
// import { contractAddress, contractAbi } from '../constants/index';

// export default function Roulette() {
//   const { address } = useAccount();
//   const [bet, setBet] = useState([["", "", ""]]);
//   return (
//     <div>
//       <h1>Roulette</h1>
//       <h2>Place your bet :</h2>
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Roulette from '../../../components/Roulette';

export default function Polygon() {
  const { address, isConnected } = useAccount();
  const [showRoulette, setShowRoulette] = useState(false);

  return (
    <>
      {isConnected ? (
        <>
          <h1>Welcome to the Polygon room</h1>
          <h1>Your address is {address}</h1>
          <h1>
            <button onClick={() => setShowRoulette(!showRoulette)}>
              Click here to play roulette (currently in development)
            </button>
          </h1>
          {showRoulette && <Roulette />}
          <h1>Play blackjack (not available yet)</h1>
        </>
      ) : (
        <>
          <h1>Welcome to the Polygon room</h1>
          <h1>Please connect your wallet</h1>
          <ConnectButton />
        </>
      )}
    </>
  );
}

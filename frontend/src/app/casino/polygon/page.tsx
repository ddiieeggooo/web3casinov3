'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Roulette from '../../../components/Roulette';
import Head from 'next/head';

export default function Polygon() {
  const { address, isConnected } = useAccount();
  const [showRoulette, setShowRoulette] = useState(false);

  return (
    <>
      <Head>
        {/* Importing fonts from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Import 'Exo 2' font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Exo+2:wght@100;400;700;900&display=swap"
          rel="stylesheet"
        />
        {/* Import 'Press Start 2P' font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="polygon-container">
        {isConnected ? (
          <>
            <h1>Welcome to the Polygon Room</h1>
            <h2>
              Your address is{' '}
              <span className="address">{address}</span>
            </h2>
            <div className="casino-tables">
              <div className="casino-table">
                <button onClick={() => setShowRoulette(!showRoulette)}>
                  Click here to play roulette
                </button>
              </div>
              {showRoulette && <Roulette />}
              <div className="casino-table">
                <button disabled>
                  Play blackjack (not available yet)
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1>Welcome to the Polygon Room</h1>
            <h2>Please connect your wallet</h2>
            <ConnectButton />
          </>
        )}
      </div>
      <style jsx>{`
        .polygon-container {
          background-color: #993bdc; /* Polygon color */
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: #fff;
          text-align: center;
        }
        h1 {
          margin-bottom: 20px;
          font-size: 2.5em;
          font-family: 'Exo 2', sans-serif;
          color: #ffd700; /* Gold color */
        }
        h2 {
          margin-bottom: 40px;
          font-size: 1.5em;
          font-family: 'Exo 2', sans-serif;
          color: #121315; /* Dark color */
        }
        .address {
          font-family: 'Press Start 2P', cursive;
          color: #ffd700; /* Gold color */
        }
        .casino-tables {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .casino-table {
          background-color: #09683a; /* SeaGreen */
          width: 350px;
          height: 180px;
          margin: 20px;
          border-radius: 60% / 10%; /* More rounded casino table shape */
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        }
        .casino-table button {
          background: none;
          border: none;
          color: #ffe067;
          font-size: 1.2em;
          cursor: pointer;
          font-family: 'Exo 2', sans-serif;
        }
        .casino-table button:disabled {
          color: #caa5ef;
          cursor: not-allowed;
        }
        .casino-table button:hover:not(:disabled) {
          transform: scale(1.05);
        }
      `}</style>
    </>
  );
}

"use client";

import Link from "next/link";
import Head from "next/head";

export default function Casino() {
  return (
    <>
      <Head>
        {/* Importing a stylish font from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="casino-container">
        <h1>Welcome to your Web3 Casino</h1>
        <div className="coin-links">
          <Link href="/casino/polygon" legacyBehavior>
            <a className="coin polygon">Polygon Room</a>
          </Link>
          <Link href="#" legacyBehavior>
            <a className="coin multiversx">MultiversX Room (Coming Soon)</a>
          </Link>
          <Link href="#" legacyBehavior>
            <a className="coin algorand">Algorand Room (Coming Soon)</a>
          </Link>
          <Link href="#" legacyBehavior>
            <a className="coin cardano">Cardano Room (Coming Soon)</a>
          </Link>
          <Link href="#" legacyBehavior>
            <a className="coin solana">Solana Room (Coming Soon)</a>
          </Link>
          <Link href="#" legacyBehavior>
            <a className="coin cosmos">Cosmos Room (Coming Soon)</a>
          </Link>
          <Link href="#" legacyBehavior>
            <a className="coin ergo">Ergo Room (Coming Soon)</a>
          </Link>
        </div>
      </div>
      <style jsx>{`
        .casino-container {
          background-color: #8B0000; /* Dark Red */
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        h1 {
          font-family: 'Playfair Display', serif;
          color: gold;
          text-shadow: 2px 2px 4px #000;
          text-align: center;
          margin-bottom: 40px;
        }
        .coin-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
        }
        .coin {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          color: #fff;
          text-decoration: none;
          text-align: center;
          padding: 10px;
          font-size: 0.9em;
          font-weight: bold;
          box-shadow: 0 0 10px #000;
          background-color: gray;
          cursor: default;
        }
        .coin:hover {
          transform: scale(1.05);
        }
        /* Individual coin colors */
        .polygon {
          background-color: #8247e5; /* Polygon Purple */
          cursor: pointer;
        }
        .multiversx {
          background-color: #1E90FF; /* Dodger Blue */
        }
        .algorand {
          background-color: #00A3E0; /* Light Blue */
        }
        .cardano {
          background-color: #0033AD; /* Dark Blue */
        }
        .solana {
          background-color: #00FFA3; /* Mint Green */
        }
        .cosmos {
          background-color: #6F2DA8; /* Violet */
        }
        .ergo {
          background-color: #FF5F00; /* Orange */
        }
        /* Disable click for coming soon rooms */
        .coin:not(.polygon) {
          pointer-events: none;
          opacity: 0.6;
        }
      `}</style>
    </>
  );
}

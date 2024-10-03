'use client';
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="container">
        <div className="header">
          <h1>DECENTRASINO</h1>
          <h1>A web3 casino app project developed with love by ddiieeggoo</h1>
        </div>
        <Link href="/casino" className="enter-link">
          Click here to enter the casino
        </Link>
      </div>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #006400; /* Casino green */
          height: 100vh;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        h1 {
          font-family: Arial, sans-serif; /* Changed the font */
          color: gold;
          text-shadow: 2px 2px 4px #000000;
        }
        .enter-link {
          font-size: 2em; /* Made the link bigger */
          color: gold;
          text-shadow: 2px 2px 4px #000000;
          text-decoration: none;
          margin-top: 20px;
        }
      `}</style>
    </>
  );
}

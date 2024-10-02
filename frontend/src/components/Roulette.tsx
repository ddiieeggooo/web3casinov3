'use client';

import { useState, useEffect } from "react";
import { useAccount, useWriteContract,useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, contractAbi } from '../constants/index';

export default function Roulette() {
  return (
    <div>
      <h1>Roulette</h1>
    </div>
  );
}

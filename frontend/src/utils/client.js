import { createPublicClient, http } from 'viem';
// import { sepolia } from 'viem/chains'
// import { polygonAmoy } from '@/utils/polygonAmoy';
import { polygon } from "viem/chains";

export const publicClient = createPublicClient({
  chain: polygon,
  transport: http("https://polygon-mainnet.g.alchemy.com/v2/FzlP6aeHHZM2KaYAdzVi8yf4r4gqebkZ"),
})

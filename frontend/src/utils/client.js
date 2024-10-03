import { createPublicClient, http } from 'viem';
// import { sepolia } from 'viem/chains'
// import { polygonAmoy } from '@/utils/polygonAmoy';
import { polygonAmoy } from "viem/chains";

export const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http("https://polygon-amoy.g.alchemy.com/v2/FzlP6aeHHZM2KaYAdzVi8yf4r4gqebkZ"),
})

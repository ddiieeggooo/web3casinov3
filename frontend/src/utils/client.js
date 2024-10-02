import { createPublicClient, http } from 'viem'
// import { sepolia } from 'viem/chains'
import { polygonAmoy } from '@/utils/polygonAmoy';

export const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http()
})

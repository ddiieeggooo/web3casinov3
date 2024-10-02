'use client';
import { ChakraProvider } from '@chakra-ui/react'
import '@rainbow-me/rainbowkit/styles.css';
// import { sepolia } from '@/utils/sepolia';

import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  sepolia,
  foundry,
  polygon,
  polygonAmoy
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const projectId = process.env.NEXT_PUBLIC_CLOUD_REOWN_APP_ID || 'defaultProjectId';

const config = getDefaultConfig({
    appName: 'Kayp',
    projectId: projectId,
    chains: [sepolia, foundry, polygon, polygonAmoy],
    ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

import { ReactNode } from 'react';

const RainbowKitAndChakraProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
                <ChakraProvider>
                    {children}
                </ChakraProvider>
            </RainbowKitProvider>
        </QueryClientProvider>
    </WagmiProvider>
  )
}

export default RainbowKitAndChakraProvider

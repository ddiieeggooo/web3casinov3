const RPC = process.env.NEXT_PUBLIC_ALCHEMY_RPC || "";

export const polygonAmoy = {
  id: 80002,
  name: 'Amoy',
  nativeCurrency: {
    name: 'Matic',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [RPC],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://amoy.polygonscan.com',
      apiUrl: 'https://api-amoy.polygonscan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 25770160,
    },
    customContract: {
      address: '0x2Fe4633d8f91765D9a63669B20ace9322bD1687f',
      blockCreated: 12681839,
    },
  },
  testnet: true,
};

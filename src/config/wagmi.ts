import { http, createConfig } from 'wagmi'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

// Define custom networks
export const hyperionTestnet = {
  id: 133717,
  name: 'Hyperion Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tMETIS',
    symbol: 'tMETIS',
  },
  rpcUrls: {
    default: {
      http: ['https://hyperion-testnet.metisdevops.link'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hyperion Explorer',
      url: 'https://hyperion-testnet-explorer.metisdevops.link',
    },
  },
  testnet: true,
}

export const lazAITestnet = {
  id: 133718,
  name: 'LazAI Pre-Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'LAZAI',
    symbol: 'LAZAI',
  },
  rpcUrls: {
    default: {
      http: ['https://lazai-testnet.metisdevops.link'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LazAI Explorer',
      url: 'https://lazai-testnet-explorer.metisdevops.link',
    },
  },
  testnet: true,
}

export const seiEvmTestnet = {
  id: 1328,
  name: 'SeiEVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'SEI',
    symbol: 'SEI',
  },
  rpcUrls: {
    default: {
      http: ['https://evm-rpc-testnet.sei-apis.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SeiEVM Explorer',
      url: 'https://testnet.seistream.app',
    },
  },
  testnet: true,
}

export const config = getDefaultConfig({
  appName: 'BeatChain - AI Music NFT Platform',
  projectId: 'beatchain-music-nft-platform',
  chains: [hyperionTestnet, lazAITestnet, seiEvmTestnet],
  transports: {
    [hyperionTestnet.id]: http(),
    [lazAITestnet.id]: http(),
    [seiEvmTestnet.id]: http(),
  },
})
# 🎵 BeatChain - AI-Powered Music NFT Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Web3](https://img.shields.io/badge/Web3-F16822?logo=web3.js&logoColor=white)](https://web3js.org/)

BeatChain is a revolutionary decentralized platform that democratizes music creation by combining cutting-edge AI technology with blockchain innovation. Create unique musical compositions using advanced AI models and mint them as NFTs for true ownership and trading.

## ✨ Features

- **🤖 AI Music Generation**: Transform your ideas into unique musical compositions using advanced AI models
- **🎨 NFT Marketplace**: Mint your AI-generated music as NFTs and trade them on our decentralized marketplace
- **⚡ Low-Cost Blockchain**: Built on Hyperion and LazAI testnets for fast, affordable transactions
- **🔐 True Ownership**: Blockchain-backed NFTs ensure authentic ownership and provenance
- **🌐 Global Community**: Connect with creators and music enthusiasts worldwide
- **📱 Responsive Design**: Beautiful, responsive interface that works on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask recommended)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd beatchain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗 Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks and functional components
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **React Router** - Client-side routing

### Blockchain & Web3
- **Wagmi** - React hooks for Ethereum development
- **RainbowKit** - Beautiful wallet connection UI
- **Hardhat** - Ethereum development environment
- **OpenZeppelin** - Secure smart contract library

### Smart Contracts
- **BeatChainNFT** - ERC-721 contract for music NFTs
- **BeatChainMarketplace** - Decentralized marketplace for trading
- **BeatChainFactory** - Factory pattern for contract deployment

### Backend & AI
- **Supabase** - Backend-as-a-Service for data management
- **Edge Functions** - Serverless functions for AI music generation

## 🌐 Supported Networks

- **Hyperion Testnet** (Chain ID: 133717) - High-performance blockchain for music NFTs
- **LazAI Pre-Testnet** (Chain ID: 133718) - Next-generation AI-optimized blockchain
- **SeiEVM Testnet** (Chain ID: 1328) - Fast and efficient EVM-compatible blockchain

## 📁 Project Structure

```
beatchain/
├── contracts/              # Smart contracts
│   ├── BeatChainNFT.sol
│   ├── BeatChainMarketplace.sol
│   └── BeatChainFactory.sol
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── Hero.tsx       # Landing page hero
│   │   ├── Navigation.tsx # Main navigation
│   │   └── ...
│   ├── pages/             # Route components
│   ├── hooks/             # Custom React hooks
│   ├── config/            # Configuration files
│   └── lib/               # Utility functions
├── supabase/              # Supabase functions
└── scripts/               # Deployment scripts
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Blockchain
npm run compile      # Compile smart contracts
npm run deploy       # Deploy contracts to testnet
npm run test         # Run contract tests

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Environment Setup

Create a `.env` file based on `.env.example`:

```env
# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
HYPERION_RPC_URL=https://rpc.hyperion.testnet
LAZAI_RPC_URL=https://rpc.lazai.testnet

# Supabase Configuration  
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔐 Smart Contract Deployment

1. **Compile contracts**
   ```bash
   npm run compile
   ```

2. **Deploy to testnet**
   ```bash
   npm run deploy
   ```

3. **Update contract addresses**
   Update `src/config/contracts.ts` with deployed addresses.

## 🎯 Core Functionality

### Music Generation
- Text-to-music AI models
- Customizable parameters (genre, mood, duration)
- High-quality audio output

### NFT Minting
- Mint AI-generated music as ERC-721 tokens
- Metadata stored on IPFS
- Royalty support for creators

### Marketplace
- List NFTs for sale
- Bidding system
- Royalty distribution
- Price discovery

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Telegram Community](https://t.me/Beat_Chain)
- [Twitter](https://x.com/Beat_Chain)
- [YouTube](https://www.youtube.com/@beat_chain)

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) - Secure smart contract library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components

---

**Built with ❤️ by the BeatChain Team**

*Democratizing music creation through AI and blockchain technology*

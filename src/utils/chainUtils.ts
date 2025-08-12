import { useChainId } from 'wagmi';

// Get the native currency symbol for the current chain
export function useNativeCurrency() {
  const chainId = useChainId();
  
  switch (chainId) {
    case 133717: // Hyperion Testnet
      return 'tMETIS';
    case 133718: // LazAI Pre-Testnet
      return 'LAZAI';
    case 1328: // SeiEVM Testnet
      return 'SEI';
    default:
      return 'ETH'; // Fallback
  }
}

// Get the native currency name for the current chain
export function useNativeCurrencyName() {
  const chainId = useChainId();
  
  switch (chainId) {
    case 133717: // Hyperion Testnet
      return 'tMETIS';
    case 133718: // LazAI Pre-Testnet
      return 'LAZAI';
    case 1328: // SeiEVM Testnet
      return 'SEI';
    default:
      return 'Ethereum'; // Fallback
  }
}
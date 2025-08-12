import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { FACTORY_ABI, HYPERION_FACTORY_ABI, FACTORY_ADDRESSES } from '@/config/contracts';
import { parseEther, formatEther } from 'viem';

export interface MusicMetadata {
  title: string;
  artist: string;
  genre: string;
  duration: bigint;
  audioUrl: string;
  coverArt: string;
  createdAt: bigint;
  isAIGenerated: boolean;
}

export function useFactoryContract() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = FACTORY_ADDRESSES[chainId] as `0x${string}` | undefined;
  
  // Use Hyperion ABI for Hyperion chain, default ABI for others
  const factoryAbi = chainId === 133717 ? HYPERION_FACTORY_ABI : FACTORY_ABI;
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: allCollections } = useReadContract({
    address: contractAddress,
    abi: factoryAbi,
    functionName: 'getAllCollections',
    query: { enabled: Boolean(contractAddress) },
  });

  const { data: creatorCollections } = useReadContract({
    address: contractAddress,
    abi: factoryAbi,
    functionName: 'getCreatorCollections',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: Boolean(contractAddress && address) },
  });

  const { data: minimumMintPrice } = useReadContract({
    address: contractAddress,
    abi: factoryAbi,
    functionName: 'minimumMintPrice',
    query: { enabled: Boolean(contractAddress) },
  });

  const { data: mintingFee } = useReadContract({
    address: contractAddress,
    abi: factoryAbi,
    functionName: 'mintingFee',
    query: { enabled: Boolean(contractAddress) },
  });

  const createCollection = async (name: string, symbol: string) => {
    if (!contractAddress) throw new Error('Contract not deployed on this network. Please switch to a supported testnet.');
    
    console.log('createCollection called with:', {
      contractAddress,
      name,
      symbol,
      chainId,
      address
    });
    
    try {
      return writeContract({ 
        address: contractAddress, 
        abi: factoryAbi, 
        functionName: 'createCollection', 
        args: [name, symbol],
        gas: chainId === 133717 ? 8000000n : undefined // Increased gas limit for Hyperion
      } as any);
    } catch (error) {
      console.error('Create collection error:', error);
      throw error;
    }
  };

  const mintNFT = async (
    collection: `0x${string}`,
    to: `0x${string}`,
    uri: string,
    metadata: MusicMetadata,
    royaltyFee: bigint,
    mintPrice: string
  ) => {
    if (!contractAddress) {
      throw new Error('Contract not deployed on this network. Please switch to a supported testnet.');
    }
    
    console.log('mintNFT called with:', {
      contractAddress,
      collection,
      to,
      uri,
      metadata,
      royaltyFee: royaltyFee.toString(),
      mintPrice,
      parsedValue: parseEther(mintPrice || '0').toString()
    });
    
    return writeContract({
      address: contractAddress,
      abi: factoryAbi,
      functionName: 'mintWithFee',
      args: [collection, to, uri, metadata, royaltyFee],
      value: parseEther(mintPrice || '0'),
      gas: chainId === 133717 ? 8000000n : undefined // Increased gas limit for Hyperion
    } as any);
  };

  return {
    contractAddress,
    collections: (allCollections as `0x${string}`[] | undefined) ?? [],
    creatorCollections: (creatorCollections as `0x${string}`[] | undefined) ?? [],
    minimumMintPrice: minimumMintPrice as bigint | undefined,
    mintingFee: mintingFee as bigint | undefined,
    createCollection,
    mintNFT,
    isCreatingOrMinting: isPending || isConfirming,
    txHash: hash,
    isConfirmed,
  };
}

export function useCreatorCollections(addr?: `0x${string}`) {
  const chainId = useChainId();
  const contractAddress = FACTORY_ADDRESSES[chainId] as `0x${string}` | undefined;
  
  // Use Hyperion ABI for Hyperion chain, default ABI for others
  const factoryAbi = chainId === 133717 ? HYPERION_FACTORY_ABI : FACTORY_ABI;
  
  const { data } = useReadContract({
    address: contractAddress,
    abi: factoryAbi,
    functionName: 'getCreatorCollections',
    args: [addr ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: Boolean(contractAddress && addr) },
  });
  return { creatorCollections: (data as `0x${string}`[] | undefined) ?? [] };
}

export const formatPrice = (price: bigint) => formatEther(price);
export const parsePrice = (price: string) => parseEther(price);

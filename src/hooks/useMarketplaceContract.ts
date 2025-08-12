import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useReadContracts } from 'wagmi';
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESSES } from '@/config/contracts';
import { parseEther, formatEther } from 'viem';

export interface Listing {
  seller: string;
  nftContract: string;
  tokenId: bigint;
  price: bigint;
  isActive: boolean;
  listedAt: bigint;
}

export interface Auction {
  seller: string;
  nftContract: string;
  tokenId: bigint;
  startingPrice: bigint;
  currentBid: bigint;
  currentBidder: string;
  endTime: bigint;
  isActive: boolean;
  createdAt: bigint;
}

export function useMarketplaceContract() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = MARKETPLACE_ADDRESSES[chainId] as `0x${string}` | undefined;
  
  // Use the same ABI for all chains since marketplace contract should be consistent
  const marketplaceAbi = MARKETPLACE_ABI;
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: listingCounter } = useReadContract({
    address: contractAddress,
    abi: marketplaceAbi,
    functionName: 'listingCounter',
    query: { enabled: Boolean(contractAddress) },
  });

  const { data: auctionCounter } = useReadContract({
    address: contractAddress,
    abi: marketplaceAbi,
    functionName: 'auctionCounter',
    query: { enabled: Boolean(contractAddress) },
  });

  const { data: platformFee } = useReadContract({
    address: contractAddress,
    abi: marketplaceAbi,
    functionName: 'platformFee',
    query: { enabled: Boolean(contractAddress) },
  });

  const { data: platformFeeRecipient } = useReadContract({
    address: contractAddress,
    abi: marketplaceAbi,
    functionName: 'platformFeeRecipient',
    query: { enabled: Boolean(contractAddress) },
  });

  const listItem = async (
    nftContract: `0x${string}`,
    tokenId: string,
    price: string
  ) => {
    if (!contractAddress) throw new Error('Unsupported chain / contract not configured');
    return writeContract({
      address: contractAddress,
      abi: marketplaceAbi,
      functionName: 'listItem',
      args: [nftContract, BigInt(tokenId), parseEther(price)],
    } as any);
  };

  const buyItem = async (listingId: string, price: string) => {
    if (!contractAddress) throw new Error('Unsupported chain / contract not configured');
    return writeContract({
      address: contractAddress,
      abi: marketplaceAbi,
      functionName: 'buyItem',
      args: [BigInt(listingId)],
      value: parseEther(price),
    } as any);
  };

  const cancelListing = async (listingId: string) => {
    if (!contractAddress) throw new Error('Unsupported chain / contract not configured');
    return writeContract({
      address: contractAddress,
      abi: marketplaceAbi,
      functionName: 'cancelListing',
      args: [BigInt(listingId)],
    } as any);
  };

  const createAuction = async (
    nftContract: `0x${string}`,
    tokenId: string,
    startingPrice: string,
    duration: string
  ) => {
    if (!contractAddress) throw new Error('Unsupported chain / contract not configured');
    return writeContract({
      address: contractAddress,
      abi: marketplaceAbi,
      functionName: 'createAuction',
      args: [nftContract, BigInt(tokenId), parseEther(startingPrice), BigInt(duration)],
    } as any);
  };

  const placeBid = async (auctionId: string, bidAmount: string) => {
    if (!contractAddress) throw new Error('Unsupported chain / contract not configured');
    return writeContract({
      address: contractAddress,
      abi: marketplaceAbi,
      functionName: 'placeBid',
      args: [BigInt(auctionId)],
      value: parseEther(bidAmount),
    } as any);
  };

  const endAuction = async (auctionId: string) => {
    if (!contractAddress) throw new Error('Unsupported chain / contract not configured');
    return writeContract({
      address: contractAddress,
      abi: marketplaceAbi,
      functionName: 'endAuction',
      args: [BigInt(auctionId)],
    } as any);
  };

  const withdrawCredits = async () => {
    if (!contractAddress) throw new Error('Unsupported chain / contract not configured');
    return writeContract({
      address: contractAddress,
      abi: marketplaceAbi,
      functionName: 'withdrawCredits',
    } as any);
  };

  // Get user's pending credits
  const { data: userCredits } = useReadContract({
    address: contractAddress,
    abi: marketplaceAbi,
    functionName: 'failedTransferCredits',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(contractAddress && address) },
  });

  return {
    contractAddress,
    listingCounter: listingCounter as bigint | undefined,
    auctionCounter: auctionCounter as bigint | undefined,
    platformFee: platformFee as bigint | undefined,
    platformFeeRecipient: platformFeeRecipient as string | undefined,
    userCredits: userCredits as bigint | undefined,
    listItem,
    buyItem,
    cancelListing,
    createAuction,
    placeBid,
    endAuction,
    withdrawCredits,
    isPending: isPending || isConfirming,
    txHash: hash,
    isConfirmed,
  };
}

export function useGetListing(listingId?: string) {
  const chainId = useChainId();
  const contractAddress = MARKETPLACE_ADDRESSES[chainId] as `0x${string}` | undefined;
  
  // Use the same ABI for all chains since marketplace contract should be consistent
  const marketplaceAbi = MARKETPLACE_ABI;
  
  const { data: listing } = useReadContract({
    address: contractAddress,
    abi: marketplaceAbi,
    functionName: 'getActiveListing',
    args: listingId ? [BigInt(listingId)] : undefined,
    query: { enabled: Boolean(contractAddress && listingId) },
  });

  return { listing: listing as Listing | undefined };
}

export function useGetAuction(auctionId?: string) {
  const chainId = useChainId();
  const contractAddress = MARKETPLACE_ADDRESSES[chainId] as `0x${string}` | undefined;
  
  // Use the same ABI for all chains since marketplace contract should be consistent
  const marketplaceAbi = MARKETPLACE_ABI;
  
  const { data: auction } = useReadContract({
    address: contractAddress,
    abi: marketplaceAbi,
    functionName: 'getActiveAuction',
    args: auctionId ? [BigInt(auctionId)] : undefined,
    query: { enabled: Boolean(contractAddress && auctionId) },
  });

  return { auction: auction as Auction | undefined };
}

// Hook to fetch all active listings
export function useGetAllListings() {
  const chainId = useChainId();
  const contractAddress = MARKETPLACE_ADDRESSES[chainId] as `0x${string}` | undefined;
  
  // Use the same ABI for all chains since marketplace contract should be consistent
  const marketplaceAbi = MARKETPLACE_ABI;
  
  const { data: listingCounter } = useReadContract({
    address: contractAddress,
    abi: marketplaceAbi,
    functionName: 'listingCounter',
    query: { enabled: Boolean(contractAddress) },
  });

  return { listings: [], loading: false, listingCounter: Number(listingCounter || 0) };
}

// Hook to get listings for a specific NFT
export function useGetNFTListing(contractAddress?: string, tokenId?: string) {
  const { listings } = useGetAllListings();
  
  const nftListing = listings.find(listing => 
    listing.nftContract.toLowerCase() === contractAddress?.toLowerCase() &&
    listing.tokenId.toString() === tokenId
  );

  return { listing: nftListing };
}

export const formatPrice = (price: bigint) => formatEther(price);
export const parsePrice = (price: string) => parseEther(price);
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { BEATCHAIN_NFT_ABI, BEATCHAIN_NFT_ADDRESSES } from '@/config/contracts';
import { formatEther } from 'viem';

export interface BeatChainMusicMetadata {
  title: string;
  artist: string;
  genre: string;
  duration: bigint;
  audioUrl: string;
  coverArt: string;
  createdAt: bigint;
  isAIGenerated: boolean;
}

export function useBeatChainNFT(contractAddress?: `0x${string}`) {
  const { address } = useAccount();
  const chainId = useChainId();
  const nftAddress = contractAddress || BEATCHAIN_NFT_ADDRESSES[chainId] as `0x${string}` | undefined;
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read contract functions
  const { data: name } = useReadContract({
    address: nftAddress,
    abi: BEATCHAIN_NFT_ABI,
    functionName: 'name',
    query: { enabled: Boolean(nftAddress) },
  });

  const { data: symbol } = useReadContract({
    address: nftAddress,
    abi: BEATCHAIN_NFT_ABI,
    functionName: 'symbol',
    query: { enabled: Boolean(nftAddress) },
  });

  const { data: totalSupply } = useReadContract({
    address: nftAddress,
    abi: BEATCHAIN_NFT_ABI,
    functionName: 'totalSupply',
    query: { enabled: Boolean(nftAddress) },
  });

  const { data: platformFee } = useReadContract({
    address: nftAddress,
    abi: BEATCHAIN_NFT_ABI,
    functionName: 'platformFee',
    query: { enabled: Boolean(nftAddress) },
  });

  const { data: platformFeeRecipient } = useReadContract({
    address: nftAddress,
    abi: BEATCHAIN_NFT_ABI,
    functionName: 'platformFeeRecipient',
    query: { enabled: Boolean(nftAddress) },
  });

  // User-specific data
  const { data: userBalance } = useReadContract({
    address: nftAddress,
    abi: BEATCHAIN_NFT_ABI,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: Boolean(nftAddress && address) },
  });

  // Write contract functions
  const mintMusicNFT = async (
    to: `0x${string}`,
    uri: string,
    metadata: BeatChainMusicMetadata,
    royaltyFee: bigint
  ) => {
    if (!nftAddress) throw new Error('Contract address not available for this chain');
    return writeContract({
      address: nftAddress,
      abi: BEATCHAIN_NFT_ABI,
      functionName: 'mintMusicNFT',
      args: [to, uri, metadata, royaltyFee],
    } as any);
  };

  const batchMintMusicNFT = async (
    to: `0x${string}`,
    uris: string[],
    metadataArray: BeatChainMusicMetadata[],
    royaltyFees: bigint[]
  ) => {
    if (!nftAddress) throw new Error('Contract address not available for this chain');
    return writeContract({
      address: nftAddress,
      abi: BEATCHAIN_NFT_ABI,
      functionName: 'batchMintMusicNFT',
      args: [to, uris, metadataArray, royaltyFees],
    } as any);
  };

  const approve = async (to: `0x${string}`, tokenId: bigint) => {
    if (!nftAddress) throw new Error('Contract address not available for this chain');
    return writeContract({
      address: nftAddress,
      abi: BEATCHAIN_NFT_ABI,
      functionName: 'approve',
      args: [to, tokenId],
    } as any);
  };

  const setApprovalForAll = async (operator: `0x${string}`, approved: boolean) => {
    if (!nftAddress) throw new Error('Contract address not available for this chain');
    return writeContract({
      address: nftAddress,
      abi: BEATCHAIN_NFT_ABI,
      functionName: 'setApprovalForAll',
      args: [operator, approved],
    } as any);
  };

  const transferFrom = async (from: `0x${string}`, to: `0x${string}`, tokenId: bigint) => {
    if (!nftAddress) throw new Error('Contract address not available for this chain');
    return writeContract({
      address: nftAddress,
      abi: BEATCHAIN_NFT_ABI,
      functionName: 'transferFrom',
      args: [from, to, tokenId],
    } as any);
  };

  const safeTransferFrom = async (from: `0x${string}`, to: `0x${string}`, tokenId: bigint, data?: `0x${string}`) => {
    if (!nftAddress) throw new Error('Contract address not available for this chain');
    const args = data ? [from, to, tokenId, data] : [from, to, tokenId];
    const functionName = data ? 'safeTransferFrom' : 'safeTransferFrom';
    return writeContract({
      address: nftAddress,
      abi: BEATCHAIN_NFT_ABI,
      functionName,
      args,
    } as any);
  };

  return {
    contractAddress: nftAddress,
    name: name as string | undefined,
    symbol: symbol as string | undefined,
    totalSupply: totalSupply as bigint | undefined,
    platformFee: platformFee as bigint | undefined,
    platformFeeRecipient: platformFeeRecipient as `0x${string}` | undefined,
    userBalance: userBalance as bigint | undefined,
    mintMusicNFT,
    batchMintMusicNFT,
    approve,
    setApprovalForAll,
    transferFrom,
    safeTransferFrom,
    isProcessing: isPending || isConfirming,
    txHash: hash,
    isConfirmed,
  };
}

// Hook for reading specific token data
export function useBeatChainNFTToken(tokenId: bigint, contractAddress?: `0x${string}`) {
  const chainId = useChainId();
  const nftAddress = contractAddress || BEATCHAIN_NFT_ADDRESSES[chainId] as `0x${string}` | undefined;

  const { data: owner } = useReadContract({
    address: nftAddress,
    abi: BEATCHAIN_NFT_ABI,
    functionName: 'ownerOf',
    args: [tokenId],
    query: { enabled: Boolean(nftAddress && tokenId !== undefined) },
  });

  const { data: tokenURI } = useReadContract({
    address: nftAddress,
    abi: BEATCHAIN_NFT_ABI,
    functionName: 'tokenURI',
    args: [tokenId],
    query: { enabled: Boolean(nftAddress && tokenId !== undefined) },
  });

  const { data: musicMetadata } = useReadContract({
    address: nftAddress,
    abi: BEATCHAIN_NFT_ABI,
    functionName: 'getMusicMetadata',
    args: [tokenId],
    query: { enabled: Boolean(nftAddress && tokenId !== undefined) },
  });

  const { data: tokenCreator } = useReadContract({
    address: nftAddress,
    abi: BEATCHAIN_NFT_ABI,
    functionName: 'tokenCreator',
    args: [tokenId],
    query: { enabled: Boolean(nftAddress && tokenId !== undefined) },
  });

  const { data: approved } = useReadContract({
    address: nftAddress,
    abi: BEATCHAIN_NFT_ABI,
    functionName: 'getApproved',
    args: [tokenId],
    query: { enabled: Boolean(nftAddress && tokenId !== undefined) },
  });

  return {
    owner: owner as `0x${string}` | undefined,
    tokenURI: tokenURI as string | undefined,
    musicMetadata: musicMetadata as BeatChainMusicMetadata | undefined,
    tokenCreator: tokenCreator as `0x${string}` | undefined,
    approved: approved as `0x${string}` | undefined,
  };
}

// Hook for reading royalty information
export function useBeatChainNFTRoyalty(tokenId: bigint, salePrice: bigint, contractAddress?: `0x${string}`) {
  const chainId = useChainId();
  const nftAddress = contractAddress || BEATCHAIN_NFT_ADDRESSES[chainId] as `0x${string}` | undefined;

  const { data: royaltyInfo } = useReadContract({
    address: nftAddress,
    abi: BEATCHAIN_NFT_ABI,
    functionName: 'royaltyInfo',
    args: [tokenId, salePrice],
    query: { enabled: Boolean(nftAddress && tokenId !== undefined && salePrice !== undefined) },
  });

  const royaltyData = royaltyInfo as [string, bigint] | undefined;
  
  return {
    receiver: royaltyData?.[0] as `0x${string}` | undefined,
    amount: royaltyData?.[1],
    amountFormatted: royaltyData?.[1] ? formatEther(royaltyData[1]) : undefined,
  };
}

// Hook for checking approval status
export function useBeatChainNFTApproval(owner: `0x${string}`, operator: `0x${string}`, contractAddress?: `0x${string}`) {
  const chainId = useChainId();
  const nftAddress = contractAddress || BEATCHAIN_NFT_ADDRESSES[chainId] as `0x${string}` | undefined;

  const { data: isApprovedForAll } = useReadContract({
    address: nftAddress,
    abi: BEATCHAIN_NFT_ABI,
    functionName: 'isApprovedForAll',
    args: [owner, operator],
    query: { enabled: Boolean(nftAddress && owner && operator) },
  });

  return {
    isApprovedForAll: isApprovedForAll as boolean | undefined,
  };
}

export const formatPrice = (price: bigint) => formatEther(price);
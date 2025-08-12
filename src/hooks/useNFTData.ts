import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useChainId, useReadContracts } from 'wagmi';
import { FACTORY_ABI, FACTORY_ADDRESSES } from '@/config/contracts';
import { useMarketplaceData } from './useMarketplaceData';
import { useNativeCurrency } from '@/utils/chainUtils';

export interface NFTData {
  tokenId: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  coverArt: string;
  audioUrl: string;
  price?: string;
  contractAddress: string;
  owner: string;
  creator: string;
  isAIGenerated: boolean;
  listedAt?: string;
}

// ABI for reading NFT data from BeatChainNFT contracts
const NFT_READ_ABI = [
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }]
  },
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getMusicMetadata',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{
      name: '',
      type: 'tuple',
      components: [
        { name: 'title', type: 'string' },
        { name: 'artist', type: 'string' },
        { name: 'genre', type: 'string' },
        { name: 'duration', type: 'uint256' },
        { name: 'audioUrl', type: 'string' },
        { name: 'coverArt', type: 'string' },
        { name: 'createdAt', type: 'uint256' },
        { name: 'isAIGenerated', type: 'bool' }
      ]
    }]
  },
  {
    name: 'tokenCreator',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }]
  }
] as const;

export function useNFTData() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(false);
  const { listings, auctions, getListingForNFT, getAuctionForNFT } = useMarketplaceData();
  const nativeCurrency = useNativeCurrency();

  const factoryAddress = FACTORY_ADDRESSES[chainId] as `0x${string}` | undefined;

  // Get user's collections
  const { data: userCollections } = useReadContract({
    address: factoryAddress,
    abi: FACTORY_ABI,
    functionName: 'getCreatorCollections',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(factoryAddress && address) },
  });

  // Get all collections for gallery view
  const { data: allCollections } = useReadContract({
    address: factoryAddress,
    abi: FACTORY_ABI,
    functionName: 'getAllCollections',
    query: { enabled: Boolean(factoryAddress) },
  });

  // Fetch NFT data from collections using wagmi
  useEffect(() => {
    const fetchNFTData = async () => {
      const collections = (allCollections as `0x${string}`[] | undefined) ?? [];
      if (collections.length === 0) {
        setNfts([]);
        return;
      }
      
      setLoading(true);
      const nftList: NFTData[] = [];

      try {
        console.log(`Fetching NFTs from ${collections.length} collections on chain ${chainId}:`, collections);
        
        // Import wagmi for contract reads
        const { readContract } = await import('wagmi/actions');
        const { config } = await import('@/config/wagmi');
        
        // For each collection, get total supply and fetch existing tokens
        for (const collection of collections) {
          try {
            console.log(`Checking collection: ${collection} on chain ${chainId}`);
            
            // Get total supply of the collection
            let totalSupply = 0;
            try {
              const supply = await readContract(config, {
                address: collection,
                abi: NFT_READ_ABI,
                functionName: 'totalSupply',
                chainId
              });
              totalSupply = Number(supply);
              console.log(`Collection ${collection} has ${totalSupply} NFTs`);
            } catch (error) {
              console.log(`Could not get total supply for ${collection}:`, error);
              continue;
            }
            
            // Fetch each NFT in the collection
            for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
              try {
                // Get music metadata
                const metadata = await readContract(config, {
                  address: collection,
                  abi: NFT_READ_ABI,
                  functionName: 'getMusicMetadata',
                  args: [BigInt(tokenId)],
                  chainId
                });
                
                // Get owner
                const owner = await readContract(config, {
                  address: collection,
                  abi: NFT_READ_ABI,
                  functionName: 'ownerOf',
                  args: [BigInt(tokenId)],
                  chainId
                });
                
                // Get creator
                const creator = await readContract(config, {
                  address: collection,
                  abi: NFT_READ_ABI,
                  functionName: 'tokenCreator',
                  args: [BigInt(tokenId)],
                  chainId
                });
                
                // Check if this NFT is listed on the marketplace or in auction
                const listing = getListingForNFT(collection, tokenId.toString());
                const auction = getAuctionForNFT(collection, tokenId.toString());
                
                let price = undefined;
                if (listing) {
                  price = `${parseFloat(listing.price).toFixed(4)} ${nativeCurrency}`;
                } else if (auction) {
                  const currentBid = parseFloat(auction.currentBid);
                  if (currentBid > 0) {
                    price = `${currentBid.toFixed(4)} ${nativeCurrency} (Current Bid)`;
                  } else {
                    price = `${parseFloat(auction.startingPrice).toFixed(4)} ${nativeCurrency} (Starting Price)`;
                  }
                }
                
                const nft: NFTData = {
                  tokenId: tokenId.toString(),
                  title: metadata.title,
                  artist: metadata.artist,
                  genre: metadata.genre,
                  duration: `${metadata.duration}s`,
                  coverArt: metadata.coverArt,
                  audioUrl: metadata.audioUrl,
                  contractAddress: collection,
                  owner: owner as string,
                  creator: creator as string,
                  isAIGenerated: metadata.isAIGenerated,
                  price,
                  listedAt: listing?.listedAt || auction?.startedAt
                };
                
                nftList.push(nft);
                console.log(`Added NFT: ${nft.title} from collection ${collection}`);
              } catch (error) {
                console.log(`Could not fetch token ${tokenId} from collection ${collection}:`, error);
              }
            }
          } catch (error) {
            console.error(`Error fetching NFTs from collection ${collection}:`, error);
          }
        }
        
        setNfts(nftList);
        console.log(`Total NFTs loaded: ${nftList.length} on chain ${chainId}`);
      } catch (error) {
        console.error('Error fetching NFT data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTData();
  }, [allCollections, address, listings, auctions, nativeCurrency]);

  const getUserNFTs = () => {
    if (!address) return [];
    const userOwnedNFTs = nfts.filter(nft => 
      nft.owner.toLowerCase() === address.toLowerCase()
    );
    console.log(`User ${address} owns ${userOwnedNFTs.length} NFTs:`, userOwnedNFTs);
    return userOwnedNFTs;
  };

  const getCreatedNFTs = () => {
    if (!address) return [];
    const userCreatedNFTs = nfts.filter(nft => 
      nft.creator.toLowerCase() === address.toLowerCase()
    );
    console.log(`User ${address} created ${userCreatedNFTs.length} NFTs:`, userCreatedNFTs);
    return userCreatedNFTs;
  };

  return {
    nfts,
    loading,
    getUserNFTs,
    getCreatedNFTs,
    totalSupply: nfts.length,
    collections: (allCollections as `0x${string}`[] | undefined) ?? [],
    userCollections: (userCollections as `0x${string}`[] | undefined) ?? []
  };
}
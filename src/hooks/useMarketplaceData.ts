import { useState, useEffect } from 'react';
import { useChainId } from 'wagmi';
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESSES } from '@/config/contracts';
import { formatEther } from 'viem';
import { useNativeCurrency } from '@/utils/chainUtils';

export interface MarketplaceListing {
  listingId: number;
  seller: string;
  nftContract: string;
  tokenId: string;
  price: string;
  isActive: boolean;
  listedAt: string;
}

export interface MarketplaceAuction {
  auctionId: number;
  seller: string;
  nftContract: string;
  tokenId: string;
  startingPrice: string;
  currentBid: string;
  highestBidder: string;
  endTime: string;
  isActive: boolean;
  startedAt: string;
}

export function useMarketplaceData() {
  const chainId = useChainId();
  const nativeCurrency = useNativeCurrency();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [auctions, setAuctions] = useState<MarketplaceAuction[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(0);

  const contractAddress = MARKETPLACE_ADDRESSES[chainId] as `0x${string}` | undefined;
  
  // Use the same ABI for all chains since marketplace contract should be consistent
  const marketplaceAbi = MARKETPLACE_ABI;

  // Refresh data function
  const refreshData = () => {
    setLastUpdate(Date.now());
  };

  useEffect(() => {
    const fetchMarketplaceData = async () => {
      if (!contractAddress) {
        console.log(`No marketplace contract address found for chain ${chainId}`);
        setListings([]);
        setAuctions([]);
        return;
      }

      console.log(`Fetching marketplace data for chain ${chainId} from contract: ${contractAddress}`);
      setLoading(true);
      try {
        const { readContract } = await import('wagmi/actions');
        const { config } = await import('@/config/wagmi');

        // Get listing counter
        const listingCounter = await readContract(config, {
          address: contractAddress,
          abi: marketplaceAbi,
          functionName: 'listingCounter',
          chainId
        });

        console.log(`Listing counter result for chain ${chainId}:`, listingCounter);

        // Get auction counter
        const auctionCounter = await readContract(config, {
          address: contractAddress,
          abi: marketplaceAbi,
          functionName: 'auctionCounter',
          chainId
        });

        console.log(`Auction counter result for chain ${chainId}:`, auctionCounter);

        const totalListings = Number(listingCounter);
        const totalAuctions = Number(auctionCounter);
        console.log(`Found ${totalListings} total listings and ${totalAuctions} total auctions on marketplace`);

        const activeListings: MarketplaceListing[] = [];
        const activeAuctions: MarketplaceAuction[] = [];

        // Fetch each listing
        for (let i = 1; i <= totalListings; i++) {
          try {
            const listing = await readContract(config, {
              address: contractAddress,
              abi: marketplaceAbi,
              functionName: 'getActiveListing',
              args: [BigInt(i)],
              chainId
            });

            if (listing && listing.isActive) {
              const marketplaceListing: MarketplaceListing = {
                listingId: i,
                seller: listing.seller,
                nftContract: listing.nftContract,
                tokenId: listing.tokenId.toString(),
                price: formatEther(listing.price),
                isActive: listing.isActive,
                listedAt: new Date(Number(listing.listedAt) * 1000).toISOString(),
              };
              
              activeListings.push(marketplaceListing);
              console.log(`Found active listing #${i}:`, marketplaceListing);
            }
          } catch (error) {
            console.log(`Could not fetch listing ${i}:`, error);
          }
        }

        // Fetch each auction
        for (let i = 1; i <= totalAuctions; i++) {
          try {
            const auction = await readContract(config, {
              address: contractAddress,
              abi: marketplaceAbi,
              functionName: 'getActiveAuction',
              args: [BigInt(i)],
              chainId
            });

            if (auction && auction.isActive) {
              const marketplaceAuction: MarketplaceAuction = {
                auctionId: i,
                seller: auction.seller,
                nftContract: auction.nftContract,
                tokenId: auction.tokenId.toString(),
                startingPrice: formatEther(auction.startingPrice),
                currentBid: formatEther(auction.currentBid),
                highestBidder: auction.currentBidder,
                endTime: new Date(Number(auction.endTime) * 1000).toISOString(),
                isActive: auction.isActive,
                startedAt: new Date(Number(auction.createdAt) * 1000).toISOString(),
              };
              
              activeAuctions.push(marketplaceAuction);
              console.log(`Found active auction #${i}:`, marketplaceAuction);
            }
          } catch (error) {
            console.log(`Could not fetch auction ${i}:`, error);
          }
        }

        setListings(activeListings);
        setAuctions(activeAuctions);
        console.log(`Total active marketplace listings: ${activeListings.length}, auctions: ${activeAuctions.length}`);
      } catch (error) {
        console.error('Error fetching marketplace data:', error);
        setListings([]);
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplaceData();
  }, [contractAddress, lastUpdate]);

  const getListingForNFT = (nftContract: string, tokenId: string) => {
    return listings.find(listing => 
      listing.nftContract.toLowerCase() === nftContract.toLowerCase() &&
      listing.tokenId === tokenId
    );
  };

  const getAuctionForNFT = (nftContract: string, tokenId: string) => {
    return auctions.find(auction => 
      auction.nftContract.toLowerCase() === nftContract.toLowerCase() &&
      auction.tokenId === tokenId
    );
  };

  const getListingsByOwner = (ownerAddress: string) => {
    return listings.filter(listing => 
      listing.seller.toLowerCase() === ownerAddress.toLowerCase()
    );
  };

  const getAuctionsByOwner = (ownerAddress: string) => {
    return auctions.filter(auction => 
      auction.seller.toLowerCase() === ownerAddress.toLowerCase()
    );
  };

  return {
    listings,
    auctions,
    loading,
    getListingForNFT,
    getListingsByOwner,
    getAuctionForNFT,
    getAuctionsByOwner,
    totalListings: listings.length,
    totalAuctions: auctions.length,
    refreshData
  };
}
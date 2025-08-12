import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useChainId } from 'wagmi';
import { MARKETPLACE_ADDRESSES, FACTORY_ADDRESSES } from '@/config/contracts';
import { formatEther } from 'viem';
import { useNativeCurrency } from '@/utils/chainUtils';

export interface ActivityItem {
  id: string;
  type: 'mint' | 'list' | 'purchase' | 'auction_start' | 'auction_end' | 'bid';
  title: string;
  description: string;
  timestamp: number;
  txHash: string;
  nftTitle?: string;
  amount?: string;
  status: 'confirmed' | 'pending' | 'failed';
}

export function useActivityData() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const nativeCurrency = useNativeCurrency();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address || !publicClient) return;

    const fetchActivities = async () => {
      setLoading(true);
      try {
        const marketplaceAddress = MARKETPLACE_ADDRESSES[chainId];
        const factoryAddress = FACTORY_ADDRESSES[chainId];
        
        if (!marketplaceAddress && !factoryAddress) {
          setActivities([]);
          return;
        }

        // Get recent blocks (last 1000 blocks to catch recent activity)
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - 1000n;

        const activityList: ActivityItem[] = [];

        // Fetch marketplace events if address exists
        if (marketplaceAddress) {
          try {
            // Get ItemListed events
            const listEvents = await publicClient.getLogs({
              address: marketplaceAddress as `0x${string}`,
              event: {
                type: 'event',
                name: 'ItemListed',
                inputs: [
                  { name: 'listingId', type: 'uint256', indexed: true },
                  { name: 'seller', type: 'address', indexed: true },
                  { name: 'nftContract', type: 'address', indexed: true },
                  { name: 'tokenId', type: 'uint256', indexed: false },
                  { name: 'price', type: 'uint256', indexed: false }
                ]
              },
              fromBlock,
              toBlock: 'latest'
            });

            for (const event of listEvents) {
              if (event.args?.seller?.toLowerCase() === address.toLowerCase()) {
                const block = await publicClient.getBlock({ blockHash: event.blockHash! });
                activityList.push({
                  id: `list_${event.transactionHash}_${event.logIndex}`,
                  type: 'list',
                  title: 'Listed NFT for Sale',
                  description: `Listed NFT #${event.args.tokenId} for ${formatEther(event.args.price || 0n)} ${nativeCurrency}`,
                  timestamp: Number(block.timestamp * 1000n),
                  txHash: event.transactionHash!,
                  amount: `${formatEther(event.args.price || 0n)} ${nativeCurrency}`,
                  status: 'confirmed'
                });
              }
            }

            // Get ItemSold events
            const soldEvents = await publicClient.getLogs({
              address: marketplaceAddress as `0x${string}`,
              event: {
                type: 'event',
                name: 'ItemSold',
                inputs: [
                  { name: 'listingId', type: 'uint256', indexed: true },
                  { name: 'buyer', type: 'address', indexed: true },
                  { name: 'seller', type: 'address', indexed: true },
                  { name: 'price', type: 'uint256', indexed: false }
                ]
              },
              fromBlock,
              toBlock: 'latest'
            });

            for (const event of soldEvents) {
              const userAddress = address.toLowerCase();
              const isBuyer = event.args?.buyer?.toLowerCase() === userAddress;
              const isSeller = event.args?.seller?.toLowerCase() === userAddress;
              
              if (isBuyer || isSeller) {
                const block = await publicClient.getBlock({ blockHash: event.blockHash! });
                activityList.push({
                  id: `purchase_${event.transactionHash}_${event.logIndex}`,
                  type: 'purchase',
                  title: isBuyer ? 'Purchased NFT' : 'NFT Sold',
                  description: isBuyer 
                    ? `Purchased NFT for ${formatEther(event.args.price || 0n)} ${nativeCurrency}`
                    : `Sold NFT for ${formatEther(event.args.price || 0n)} ${nativeCurrency}`,
                  timestamp: Number(block.timestamp * 1000n),
                  txHash: event.transactionHash!,
                  amount: `${formatEther(event.args.price || 0n)} ${nativeCurrency}`,
                  status: 'confirmed'
                });
              }
            }

            // Get AuctionCreated events
            const auctionEvents = await publicClient.getLogs({
              address: marketplaceAddress as `0x${string}`,
              event: {
                type: 'event',
                name: 'AuctionCreated',
                inputs: [
                  { name: 'auctionId', type: 'uint256', indexed: true },
                  { name: 'seller', type: 'address', indexed: true },
                  { name: 'nftContract', type: 'address', indexed: true },
                  { name: 'tokenId', type: 'uint256', indexed: false },
                  { name: 'startingPrice', type: 'uint256', indexed: false },
                  { name: 'endTime', type: 'uint256', indexed: false }
                ]
              },
              fromBlock,
              toBlock: 'latest'
            });

            for (const event of auctionEvents) {
              if (event.args?.seller?.toLowerCase() === address.toLowerCase()) {
                const block = await publicClient.getBlock({ blockHash: event.blockHash! });
                activityList.push({
                  id: `auction_${event.transactionHash}_${event.logIndex}`,
                  type: 'auction_start',
                  title: 'Started Auction',
                  description: `Started auction for NFT #${event.args.tokenId} with starting price ${formatEther(event.args.startingPrice || 0n)} ${nativeCurrency}`,
                  timestamp: Number(block.timestamp * 1000n),
                  txHash: event.transactionHash!,
                  amount: `${formatEther(event.args.startingPrice || 0n)} ${nativeCurrency}`,
                  status: 'confirmed'
                });
              }
            }

            // Get BidPlaced events
            const bidEvents = await publicClient.getLogs({
              address: marketplaceAddress as `0x${string}`,
              event: {
                type: 'event',
                name: 'BidPlaced',
                inputs: [
                  { name: 'auctionId', type: 'uint256', indexed: true },
                  { name: 'bidder', type: 'address', indexed: true },
                  { name: 'amount', type: 'uint256', indexed: false }
                ]
              },
              fromBlock,
              toBlock: 'latest'
            });

            for (const event of bidEvents) {
              if (event.args?.bidder?.toLowerCase() === address.toLowerCase()) {
                const block = await publicClient.getBlock({ blockHash: event.blockHash! });
                activityList.push({
                  id: `bid_${event.transactionHash}_${event.logIndex}`,
                  type: 'bid',
                  title: 'Placed Bid',
                  description: `Placed bid of ${formatEther(event.args.amount || 0n)} ${nativeCurrency} on auction #${event.args.auctionId}`,
                  timestamp: Number(block.timestamp * 1000n),
                  txHash: event.transactionHash!,
                  amount: `${formatEther(event.args.amount || 0n)} ${nativeCurrency}`,
                  status: 'confirmed'
                });
              }
            }

            // Get AuctionEnded events
            const auctionEndEvents = await publicClient.getLogs({
              address: marketplaceAddress as `0x${string}`,
              event: {
                type: 'event',
                name: 'AuctionEnded',
                inputs: [
                  { name: 'auctionId', type: 'uint256', indexed: true },
                  { name: 'winner', type: 'address', indexed: true },
                  { name: 'winningBid', type: 'uint256', indexed: false }
                ]
              },
              fromBlock,
              toBlock: 'latest'
            });

            for (const event of auctionEndEvents) {
              const isWinner = event.args?.winner?.toLowerCase() === address.toLowerCase();
              if (isWinner) {
                const block = await publicClient.getBlock({ blockHash: event.blockHash! });
                activityList.push({
                  id: `auction_end_${event.transactionHash}_${event.logIndex}`,
                  type: 'auction_end',
                  title: 'Won Auction',
                  description: `Won auction #${event.args.auctionId} with bid of ${formatEther(event.args.winningBid || 0n)} ${nativeCurrency}`,
                  timestamp: Number(block.timestamp * 1000n),
                  txHash: event.transactionHash!,
                  amount: `${formatEther(event.args.winningBid || 0n)} ${nativeCurrency}`,
                  status: 'confirmed'
                });
              }
            }
          } catch (error) {
            console.error('Error fetching marketplace events:', error);
            console.error('Chain ID:', chainId);
            console.error('Marketplace Address:', marketplaceAddress);
          }
        }

        // Fetch factory events for minting if address exists
        if (factoryAddress) {
          try {
            const mintEvents = await publicClient.getLogs({
              address: factoryAddress as `0x${string}`,
              event: {
                type: 'event',
                name: 'CollectionCreated',
                inputs: [
                  { name: 'creator', type: 'address', indexed: true },
                  { name: 'collection', type: 'address', indexed: true },
                  { name: 'name', type: 'string', indexed: false },
                  { name: 'symbol', type: 'string', indexed: false }
                ]
              },
              fromBlock,
              toBlock: 'latest'
            });

            for (const event of mintEvents) {
              if (event.args?.creator?.toLowerCase() === address.toLowerCase()) {
                const block = await publicClient.getBlock({ blockHash: event.blockHash! });
                activityList.push({
                  id: `mint_${event.transactionHash}_${event.logIndex}`,
                  type: 'mint',
                  title: 'Created Collection',
                  description: `Created new music collection: ${event.args.name}`,
                  timestamp: Number(block.timestamp * 1000n),
                  txHash: event.transactionHash!,
                  status: 'confirmed'
                });
              }
            }
          } catch (error) {
            console.log('Error fetching factory events:', error);
          }
        }

        // Sort activities by timestamp (newest first)
        activityList.sort((a, b) => b.timestamp - a.timestamp);
        
        setActivities(activityList);
      } catch (error) {
        console.error('Error fetching activity data:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [address, publicClient, chainId, nativeCurrency]);

  return {
    activities,
    loading
  };
}
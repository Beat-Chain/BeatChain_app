import { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useMarketplaceContract, useGetListing, useGetAuction, formatPrice } from '@/hooks/useMarketplaceContract';
import { useMarketplaceData } from '@/hooks/useMarketplaceData';
import { useToast } from '@/hooks/use-toast';
import { Store, Gavel, CreditCard, Timer, Loader2 } from 'lucide-react';
import { useNativeCurrency } from '@/utils/chainUtils';

const setSEO = (title: string, description: string) => {
  document.title = title;
  const meta = document.querySelector("meta[name='description']");
  if (meta) meta.setAttribute('content', description);
  else {
    const m = document.createElement('meta');
    m.setAttribute('name', 'description');
    m.setAttribute('content', description);
    document.head.appendChild(m);
  }
};

const MarketplacePage = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();

  useEffect(() => {
    setSEO(
      'BeatChain Marketplace - Trade Music NFTs',
      'List, buy, and bid on music NFTs in the BeatChain decentralized marketplace'
    );
  }, []);

  const marketplace = useMarketplaceContract();
  const { listings, loading: marketplaceLoading } = useMarketplaceData();
  const nativeCurrency = useNativeCurrency();

  // Listing states
  const [listNftContract, setListNftContract] = useState('');
  const [listTokenId, setListTokenId] = useState('');
  const [listPrice, setListPrice] = useState('');

  // Buy states
  const [buyListingId, setBuyListingId] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  // Auction states
  const [auctionNftContract, setAuctionNftContract] = useState('');
  const [auctionTokenId, setAuctionTokenId] = useState('');
  const [auctionStartingPrice, setAuctionStartingPrice] = useState('');
  const [auctionDuration, setAuctionDuration] = useState('86400'); // 24 hours in seconds

  // Bid states
  const [bidAuctionId, setBidAuctionId] = useState('');
  const [bidAmount, setBidAmount] = useState('');

  // View states
  const [viewListingId, setViewListingId] = useState('');
  const [viewAuctionId, setViewAuctionId] = useState('');

  const { listing } = useGetListing(viewListingId);
  const { auction } = useGetAuction(viewAuctionId);

  const onListItem = async () => {
    try {
      await marketplace.listItem(
        listNftContract as `0x${string}`,
        listTokenId,
        listPrice
      );
      toast({ title: 'Transaction sent', description: 'Listing item...' });
    } catch (e: any) {
      toast({ title: 'Listing failed', description: e?.shortMessage || e?.message || 'Error', variant: 'destructive' });
    }
  };

  const onBuyItem = async () => {
    try {
      await marketplace.buyItem(buyListingId, buyPrice);
      toast({ title: 'Transaction sent', description: 'Buying item...' });
    } catch (e: any) {
      toast({ title: 'Purchase failed', description: e?.shortMessage || e?.message || 'Error', variant: 'destructive' });
    }
  };

  const onCreateAuction = async () => {
    try {
      await marketplace.createAuction(
        auctionNftContract as `0x${string}`,
        auctionTokenId,
        auctionStartingPrice,
        auctionDuration
      );
      toast({ title: 'Transaction sent', description: 'Creating auction...' });
    } catch (e: any) {
      toast({ title: 'Auction creation failed', description: e?.shortMessage || e?.message || 'Error', variant: 'destructive' });
    }
  };

  const onPlaceBid = async () => {
    try {
      await marketplace.placeBid(bidAuctionId, bidAmount);
      toast({ title: 'Transaction sent', description: 'Placing bid...' });
    } catch (e: any) {
      toast({ title: 'Bid failed', description: e?.shortMessage || e?.message || 'Error', variant: 'destructive' });
    }
  };

  const onWithdrawCredits = async () => {
    try {
      await marketplace.withdrawCredits();
      toast({ title: 'Transaction sent', description: 'Withdrawing credits...' });
    } catch (e: any) {
      toast({ title: 'Withdrawal failed', description: e?.shortMessage || e?.message || 'Error', variant: 'destructive' });
    }
  };

  const formatDuration = (seconds: bigint) => {
    const hours = Number(seconds) / 3600;
    if (hours < 24) return `${hours.toFixed(1)} hours`;
    return `${(hours / 24).toFixed(1)} days`;
  };

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const isAuctionActive = (auction: any) => {
    return auction?.isActive && Number(auction.endTime) * 1000 > Date.now();
  };

  return (
    <main className="pt-20 pb-12">
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">BeatChain Marketplace</h1>
            <p className="text-lg text-muted-foreground">Trade music NFTs, create auctions, and discover new beats</p>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Marketplace Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>Wallet: {isConnected ? address : 'Not connected'}</div>
              <div>Chain ID: {chainId}</div>
              <div>Marketplace: {marketplace.contractAddress ?? 'Unsupported on this chain'}</div>
              {marketplace.platformFee !== undefined && (
                <div>Platform Fee: {marketplace.platformFee.toString()} bps</div>
              )}
              {marketplace.listingCounter !== undefined && (
                <div>Total Listings: {marketplace.listingCounter.toString()}</div>
              )}
              {marketplace.auctionCounter !== undefined && (
                <div>Total Auctions: {marketplace.auctionCounter.toString()}</div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="listings">Listings</TabsTrigger>
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="sell">Sell</TabsTrigger>
              <TabsTrigger value="auction">Auction</TabsTrigger>
              <TabsTrigger value="bid">Bid</TabsTrigger>
              <TabsTrigger value="manage">Manage</TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    Active Marketplace Listings ({listings.length})
                  </CardTitle>
                  <CardDescription>Browse all NFTs currently listed for sale</CardDescription>
                </CardHeader>
                <CardContent>
                  {marketplaceLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading marketplace listings...</span>
                    </div>
                  ) : listings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No active listings found</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Be the first to list an NFT for sale!
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {listings.map((listing) => (
                        <Card key={listing.listingId} className="bg-muted/20">
                          <CardContent className="pt-4">
                            <div className="grid gap-2 text-sm">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">Listing #{listing.listingId}</div>
                                  <div className="text-muted-foreground">Contract: {listing.nftContract.slice(0, 10)}...</div>
                                  <div className="text-muted-foreground">Token ID: {listing.tokenId}</div>
                                  <div className="text-muted-foreground">Seller: {listing.seller.slice(0, 10)}...</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-primary">{listing.price} {nativeCurrency}</div>
                                  <Badge variant={listing.isActive ? "default" : "secondary"}>
                                    {listing.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => {
                                    setBuyListingId(listing.listingId.toString());
                                    setBuyPrice(listing.price);
                                    // Trigger buy action
                                    marketplace.buyItem(listing.listingId.toString(), listing.price)
                                      .then(() => toast({ title: 'Purchase initiated', description: 'Transaction sent' }))
                                      .catch((e: any) => toast({ title: 'Purchase failed', description: e?.shortMessage || e?.message || 'Error', variant: 'destructive' }));
                                  }}
                                  disabled={marketplace.isPending}
                                >
                                  {marketplace.isPending ? 'Processing...' : 'Buy Now'}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                  setViewListingId(listing.listingId.toString());
                                }}>
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="buy" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Buy Item
                  </CardTitle>
                  <CardDescription>Purchase a listed music NFT</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Listing ID</Label>
                      <Input 
                        value={buyListingId} 
                        onChange={(e) => setBuyListingId(e.target.value)} 
                        placeholder="1, 2, 3..." 
                      />
                    </div>
                    <div>
                      <Label>Price ({nativeCurrency})</Label>
                      <Input 
                        value={buyPrice} 
                        onChange={(e) => setBuyPrice(e.target.value)} 
                        placeholder="0.1" 
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        className="w-full" 
                        onClick={onBuyItem} 
                        disabled={!buyListingId || !buyPrice || marketplace.isPending}
                      >
                        {marketplace.isPending ? 'Processing...' : 'Buy Now'}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>View Listing Details</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        value={viewListingId} 
                        onChange={(e) => setViewListingId(e.target.value)} 
                        placeholder="Enter listing ID" 
                        className="flex-1"
                      />
                    </div>
                    {listing && (
                      <Card className="mt-4 bg-muted/20">
                        <CardContent className="pt-4">
                          <div className="grid gap-2 text-sm">
                            <div>Seller: {listing.seller}</div>
                            <div>NFT Contract: {listing.nftContract}</div>
                            <div>Token ID: {listing.tokenId.toString()}</div>
                            <div>Price: {formatPrice(listing.price)} {nativeCurrency}</div>
                            <div>Listed At: {formatTimestamp(listing.listedAt)}</div>
                            <div>
                              Status: <Badge variant={listing.isActive ? "default" : "secondary"}>
                                {listing.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sell" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    List Item for Sale
                  </CardTitle>
                  <CardDescription>List your music NFT on the marketplace</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label>NFT Contract Address</Label>
                      <Input 
                        value={listNftContract} 
                        onChange={(e) => setListNftContract(e.target.value)} 
                        placeholder="0x..." 
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Token ID</Label>
                        <Input 
                          value={listTokenId} 
                          onChange={(e) => setListTokenId(e.target.value)} 
                          placeholder="1, 2, 3..." 
                        />
                      </div>
                      <div>
                        <Label>Price ({nativeCurrency})</Label>
                        <Input 
                          value={listPrice} 
                          onChange={(e) => setListPrice(e.target.value)} 
                          placeholder="0.1" 
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={onListItem} 
                      disabled={!listNftContract || !listTokenId || !listPrice || marketplace.isPending}
                      className="w-full"
                    >
                      {marketplace.isPending ? 'Processing...' : 'List Item'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auction" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="w-5 h-5" />
                    Create Auction
                  </CardTitle>
                  <CardDescription>Start an auction for your music NFT</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label>NFT Contract Address</Label>
                      <Input 
                        value={auctionNftContract} 
                        onChange={(e) => setAuctionNftContract(e.target.value)} 
                        placeholder="0x..." 
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Token ID</Label>
                        <Input 
                          value={auctionTokenId} 
                          onChange={(e) => setAuctionTokenId(e.target.value)} 
                          placeholder="1, 2, 3..." 
                        />
                      </div>
                      <div>
                        <Label>Starting Price ({nativeCurrency})</Label>
                        <Input 
                          value={auctionStartingPrice} 
                          onChange={(e) => setAuctionStartingPrice(e.target.value)} 
                          placeholder="0.1" 
                        />
                      </div>
                      <div>
                        <Label>Duration (seconds)</Label>
                        <Input 
                          value={auctionDuration} 
                          onChange={(e) => setAuctionDuration(e.target.value)} 
                          placeholder="86400" 
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={onCreateAuction} 
                      disabled={!auctionNftContract || !auctionTokenId || !auctionStartingPrice || marketplace.isPending}
                      className="w-full"
                    >
                      {marketplace.isPending ? 'Processing...' : 'Create Auction'}
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <Label>View Auction Details</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        value={viewAuctionId} 
                        onChange={(e) => setViewAuctionId(e.target.value)} 
                        placeholder="Enter auction ID" 
                        className="flex-1"
                      />
                    </div>
                    {auction && (
                      <Card className="mt-4 bg-muted/20">
                        <CardContent className="pt-4">
                          <div className="grid gap-2 text-sm">
                            <div>Seller: {auction.seller}</div>
                            <div>NFT Contract: {auction.nftContract}</div>
                            <div>Token ID: {auction.tokenId.toString()}</div>
                            <div>Starting Price: {formatPrice(auction.startingPrice)} {nativeCurrency}</div>
                            <div>Current Bid: {formatPrice(auction.currentBid)} {nativeCurrency}</div>
                            <div>Current Bidder: {auction.currentBidder}</div>
                            <div>End Time: {formatTimestamp(auction.endTime)}</div>
                            <div>Created At: {formatTimestamp(auction.createdAt)}</div>
                            <div>
                              Status: <Badge variant={isAuctionActive(auction) ? "default" : "secondary"}>
                                {isAuctionActive(auction) ? 'Active' : 'Ended'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bid" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    Place Bid
                  </CardTitle>
                  <CardDescription>Bid on an active auction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Auction ID</Label>
                      <Input 
                        value={bidAuctionId} 
                        onChange={(e) => setBidAuctionId(e.target.value)} 
                        placeholder="1, 2, 3..." 
                      />
                    </div>
                    <div>
                      <Label>Bid Amount ({nativeCurrency})</Label>
                      <Input 
                        value={bidAmount} 
                        onChange={(e) => setBidAmount(e.target.value)} 
                        placeholder="0.15" 
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        className="w-full" 
                        onClick={onPlaceBid} 
                        disabled={!bidAuctionId || !bidAmount || marketplace.isPending}
                      >
                        {marketplace.isPending ? 'Processing...' : 'Place Bid'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manage" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Manage Account</CardTitle>
                  <CardDescription>Cancel listings and withdraw credits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Cancel Listing</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        placeholder="Enter listing ID to cancel" 
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            if (input.value) {
                              marketplace.cancelListing(input.value).then(() => {
                                toast({ title: 'Transaction sent', description: 'Cancelling listing...' });
                                input.value = '';
                              }).catch((e: any) => {
                                toast({ title: 'Cancel failed', description: e?.shortMessage || e?.message || 'Error', variant: 'destructive' });
                              });
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>End Auction</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        placeholder="Enter auction ID to end" 
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            if (input.value) {
                              marketplace.endAuction(input.value).then(() => {
                                toast({ title: 'Transaction sent', description: 'Ending auction...' });
                                input.value = '';
                              }).catch((e: any) => {
                                toast({ title: 'End auction failed', description: e?.shortMessage || e?.message || 'Error', variant: 'destructive' });
                              });
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Button 
                      onClick={onWithdrawCredits} 
                      disabled={marketplace.isPending}
                      variant="outline"
                      className="w-full"
                    >
                      {marketplace.isPending ? 'Processing...' : 'Withdraw Credits'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Withdraw any failed transfer credits to your wallet
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
};

export default MarketplacePage;
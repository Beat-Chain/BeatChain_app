import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketplaceContract } from "@/hooks/useMarketplaceContract";
import { useBeatChainNFT, useBeatChainNFTApproval } from "@/hooks/useBeatChainNFT";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store, Clock, Shield } from "lucide-react";
import { NFTData } from "@/hooks/useNFTData";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useNativeCurrency } from "@/utils/chainUtils";

interface ListNFTDialogProps {
  nft: NFTData;
  children: React.ReactNode;
}

const ListNFTDialog: React.FC<ListNFTDialogProps> = ({ nft, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [listingPrice, setListingPrice] = useState("");
  const [auctionStartPrice, setAuctionStartPrice] = useState("");
  const [auctionDuration, setAuctionDuration] = useState("7"); // days
  const [activeTab, setActiveTab] = useState("listing");
  
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const marketplace = useMarketplaceContract();
  const nftContract = useBeatChainNFT(nft.contractAddress as `0x${string}`);
  const { isApprovedForAll } = useBeatChainNFTApproval(
    address as `0x${string}`, 
    marketplace.contractAddress as `0x${string}`, 
    nft.contractAddress as `0x${string}`
  );
  const { toast } = useToast();
  const nativeCurrency = useNativeCurrency();

  // Watch for transaction confirmation and refetch approval status
  useEffect(() => {
    if (nftContract.isConfirmed && nftContract.txHash) {
      queryClient.invalidateQueries({ 
        queryKey: ['readContract'] 
      });
      console.log('NFT contract transaction confirmed, refetching approval status');
    }
  }, [nftContract.isConfirmed, nftContract.txHash, queryClient]);

  const handleApproval = async () => {
    try {
      console.log('Current approval status:', isApprovedForAll);
      console.log('Starting approval for marketplace:', marketplace.contractAddress);
      console.log('NFT contract address:', nft.contractAddress);
      console.log('User address:', address);
      
      await nftContract.setApprovalForAll(marketplace.contractAddress as `0x${string}`, true);
      
      toast({
        title: "Approval Transaction Submitted",
        description: "Please wait for blockchain confirmation..."
      });
    } catch (error: any) {
      console.error('Approval failed:', error);
      toast({
        title: "Approval Failed",
        description: error?.message || "Failed to approve marketplace",
        variant: "destructive"
      });
    }
  };

  const handleListForSale = async () => {
    if (!listingPrice || parseFloat(listingPrice) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }

    if (!isApprovedForAll) {
      toast({
        title: "Approval Required",
        description: "Please approve the marketplace to transfer your NFT first",
        variant: "destructive"
      });
      return;
    }

    try {
      await marketplace.listItem(
        nft.contractAddress as `0x${string}`,
        nft.tokenId,
        listingPrice
      );
      
      toast({
        title: "NFT Listed Successfully",
        description: `Your NFT "${nft.title}" has been listed for ${listingPrice} ${nativeCurrency}`
      });
      
      // Refresh all data after successful listing
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['readContract'] });
      }, 2000);
      
      setIsOpen(false);
      setListingPrice("");
    } catch (error: any) {
      toast({
        title: "Listing Failed",
        description: error?.message || "Failed to list NFT",
        variant: "destructive"
      });
    }
  };

  const handleCreateAuction = async () => {
    if (!auctionStartPrice || parseFloat(auctionStartPrice) <= 0) {
      toast({
        title: "Invalid Starting Price",
        description: "Please enter a valid starting price",
        variant: "destructive"
      });
      return;
    }

    if (!isApprovedForAll) {
      toast({
        title: "Approval Required",
        description: "Please approve the marketplace to transfer your NFT first",
        variant: "destructive"
      });
      return;
    }

    const durationInSeconds = parseInt(auctionDuration) * 24 * 60 * 60; // Convert days to seconds

    try {
      await marketplace.createAuction(
        nft.contractAddress as `0x${string}`,
        nft.tokenId,
        auctionStartPrice,
        durationInSeconds.toString()
      );
      
      toast({
        title: "Auction Created Successfully",
        description: `Your NFT "${nft.title}" is now up for auction starting at ${auctionStartPrice} ${nativeCurrency}`
      });
      
      // Refresh all data after successful auction creation
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['readContract'] });
      }, 2000);
      
      setIsOpen(false);
      setAuctionStartPrice("");
      setAuctionDuration("7");
    } catch (error: any) {
      toast({
        title: "Auction Creation Failed",
        description: error?.message || "Failed to create auction",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>List "{nft.title}" for Sale</DialogTitle>
          <DialogDescription>
            Choose how you'd like to sell your NFT on the marketplace
          </DialogDescription>
        </DialogHeader>

        {!isApprovedForAll && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-amber-600" />
                <div>
                  <h3 className="font-medium text-amber-900 dark:text-amber-100">Approval Required</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    You need to approve the marketplace to transfer your NFT before listing it for sale.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleApproval}
                  disabled={nftContract.isProcessing}
                  className="flex-1"
                  variant="outline"
                >
                  {nftContract.isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Approving...
                    </>
                  ) : (
                    "Approve Marketplace"
                  )}
                </Button>
                <Button 
                  onClick={() => {
                    console.log('Manually refreshing approval status...');
                    queryClient.invalidateQueries({ queryKey: ['readContract'] });
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isApprovedForAll && (
          <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
            ✅ Marketplace approved - you can now list your NFT!
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listing" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Fixed Price
            </TabsTrigger>
            <TabsTrigger value="auction" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Auction
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fixed Price Listing</CardTitle>
                <CardDescription>
                  Set a fixed price for your NFT. Buyers can purchase it immediately.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="listing-price">Price ({nativeCurrency})</Label>
                  <Input
                    id="listing-price"
                    type="number"
                    step="0.001"
                    placeholder={`Enter price in ${nativeCurrency}`}
                    value={listingPrice}
                    onChange={(e) => setListingPrice(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleListForSale} 
                  className="w-full"
                  disabled={marketplace.isPending || !listingPrice || !isApprovedForAll}
                >
                  {marketplace.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Listing NFT...
                    </>
                  ) : (
                    "List for Sale"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auction" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Auction Listing</CardTitle>
                <CardDescription>
                  Let buyers bid on your NFT. The highest bidder wins when the auction ends.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auction-start-price">Starting Price ({nativeCurrency})</Label>
                  <Input
                    id="auction-start-price"
                    type="number"
                    step="0.001"
                    placeholder="Minimum starting bid"
                    value={auctionStartPrice}
                    onChange={(e) => setAuctionStartPrice(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="auction-duration">Duration (Days)</Label>
                  <Input
                    id="auction-duration"
                    type="number"
                    min="1"
                    max="30"
                    placeholder="Auction duration in days"
                    value={auctionDuration}
                    onChange={(e) => setAuctionDuration(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleCreateAuction} 
                  className="w-full"
                  disabled={marketplace.isPending || !auctionStartPrice || !isApprovedForAll}
                >
                  {marketplace.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating Auction...
                    </>
                  ) : (
                    "Create Auction"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ListNFTDialog;
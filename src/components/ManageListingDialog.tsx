import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarketplaceContract } from "@/hooks/useMarketplaceContract";
import { useMarketplaceData } from "@/hooks/useMarketplaceData";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit, X, DollarSign, Gavel, Clock } from "lucide-react";
import { NFTData } from "@/hooks/useNFTData";
import { MarketplaceListing, MarketplaceAuction } from "@/hooks/useMarketplaceData";
import { useNativeCurrency } from "@/utils/chainUtils";
import { useQueryClient } from "@tanstack/react-query";

interface ManageListingDialogProps {
  nft: NFTData;
  listing?: MarketplaceListing;
  auction?: MarketplaceAuction;
  children: React.ReactNode;
}

const ManageListingDialog: React.FC<ManageListingDialogProps> = ({ 
  nft, 
  listing, 
  auction, 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [activeTab, setActiveTab] = useState("current");
  
  const marketplace = useMarketplaceContract();
  const { refreshData } = useMarketplaceData();
  const { toast } = useToast();
  const nativeCurrency = useNativeCurrency();
  const queryClient = useQueryClient();

  const isAuctionItem = Boolean(auction);
  const isListedItem = Boolean(listing);
  const currentType = isAuctionItem ? "auction" : "listing";

  const handleUnlist = async () => {
    try {
      if (listing) {
        console.log('Canceling listing:', listing.listingId.toString());
        await marketplace.cancelListing(listing.listingId.toString());
        toast({
          title: "NFT Unlisted Successfully",
          description: "Your NFT has been removed from the marketplace"
        });
      } else if (auction) {
        console.log('Ending auction:', {
          auctionId: auction.auctionId.toString(),
          endTime: auction.endTime,
          isActive: auction.isActive,
          currentTime: Date.now()
        });
        await marketplace.endAuction(auction.auctionId.toString());
        toast({
          title: "Auction Ended Successfully", 
          description: "Your auction has been ended"
        });
      }
      
      // Refresh data
      setTimeout(() => {
        refreshData();
        queryClient.invalidateQueries({ queryKey: ['readContract'] });
      }, 2000);
      
      setIsOpen(false);
    } catch (error: any) {
      console.error("Failed to unlist/end auction:", error);
      toast({
        title: "Operation Failed",
        description: error?.message || error?.reason || "Failed to remove NFT from marketplace",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePrice = async () => {
    if (!newPrice || parseFloat(newPrice) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }

    try {
      // First cancel/end current listing/auction
      if (listing) {
        await marketplace.cancelListing(listing.listingId.toString());
      } else if (auction) {
        await marketplace.endAuction(auction.auctionId.toString());
      }
      
      // Wait for transaction confirmation
      setTimeout(async () => {
        try {
          // List with new price as fixed price listing
          await marketplace.listItem(
            nft.contractAddress as `0x${string}`,
            nft.tokenId,
            newPrice
          );
          
          toast({
            title: "Price Updated Successfully",
            description: `NFT price updated to ${newPrice} ${nativeCurrency}`
          });
          
          // Refresh data
          setTimeout(() => {
            refreshData();
            queryClient.invalidateQueries({ queryKey: ['readContract'] });
          }, 2000);
          
          setIsOpen(false);
        } catch (error: any) {
          toast({
            title: "Re-listing Failed",
            description: error?.message || "Failed to re-list NFT with new price",
            variant: "destructive"
          });
        }
      }, 3000);
      
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update NFT price",
        variant: "destructive"
      });
    }
  };

  const handleSwitchToAuction = async () => {
    if (!newPrice || parseFloat(newPrice) <= 0) {
      toast({
        title: "Invalid Starting Price",
        description: "Please enter a valid starting price",
        variant: "destructive"
      });
      return;
    }

    try {
      // Cancel current listing if exists
      if (listing) {
        await marketplace.cancelListing(listing.listingId.toString());
      }
      
      // Wait for transaction confirmation
      setTimeout(async () => {
        try {
          console.log('Creating auction:', {
            nftContract: nft.contractAddress,
            tokenId: nft.tokenId,
            startingPrice: newPrice,
            duration: "604800"
          });
          // Create auction with 7 days duration (604800 seconds)
          await marketplace.createAuction(
            nft.contractAddress as `0x${string}`,
            nft.tokenId,
            newPrice,
            "604800" // 7 days in seconds
          );
          
          toast({
            title: "Auction Created Successfully",
            description: `NFT listed for auction with starting price ${newPrice} ${nativeCurrency}`
          });
          
          // Refresh data
          setTimeout(() => {
            refreshData();
            queryClient.invalidateQueries({ queryKey: ['readContract'] });
          }, 2000);
          
          setIsOpen(false);
        } catch (error: any) {
          console.error("Auction creation failed:", error);
          toast({
            title: "Auction Creation Failed",
            description: error?.message || error?.reason || "Failed to create auction",
            variant: "destructive"
          });
        }
      }, 3000);
      
    } catch (error: any) {
      toast({
        title: "Operation Failed",
        description: error?.message || "Failed to switch to auction",
        variant: "destructive"
      });
    }
  };

  const getCurrentMarketInfo = () => {
    if (auction) {
      const currentBid = parseFloat(auction.currentBid);
      const startingPrice = parseFloat(auction.startingPrice);
      const hasActiveBids = currentBid > 0;
      
      return {
        type: 'Auction',
        price: hasActiveBids ? auction.currentBid : auction.startingPrice,
        label: hasActiveBids ? 'Current Bid' : 'Starting Price',
        endTime: new Date(auction.endTime),
        isActive: auction.isActive,
        icon: <Gavel className="h-4 w-4" />
      };
    }
    
    if (listing) {
      return {
        type: 'Fixed Price',
        price: listing.price,
        label: 'Listed Price',
        isActive: listing.isActive,
        icon: <DollarSign className="h-4 w-4" />
      };
    }
    
    return null;
  };

  const marketInfo = getCurrentMarketInfo();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage "{nft.title}"</DialogTitle>
          <DialogDescription>
            Update your listing price, switch between auction and fixed price, or remove from marketplace
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current Listing</TabsTrigger>
            <TabsTrigger value="modify">Modify Listing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            {marketInfo && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {marketInfo.icon}
                        <span className="font-semibold">{marketInfo.type}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        marketInfo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {marketInfo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{marketInfo.label}</span>
                        <span className="text-lg font-bold text-primary">
                          {parseFloat(marketInfo.price).toFixed(4)} {nativeCurrency}
                        </span>
                      </div>
                    </div>
                    
                    {marketInfo.endTime && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        Ends: {marketInfo.endTime.toLocaleDateString()} at {marketInfo.endTime.toLocaleTimeString()}
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleUnlist} 
                      variant="destructive"
                      className="w-full"
                      disabled={marketplace.isPending}
                    >
                      {marketplace.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          {isAuctionItem ? "End Auction" : "Remove Listing"}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="modify">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-price">New Price ({nativeCurrency})</Label>
                  <Input
                    id="new-price"
                    type="number"
                    step="0.001"
                    placeholder={`Enter price in ${nativeCurrency}`}
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={handleUpdatePrice} 
                    className="w-full"
                    disabled={marketplace.isPending || !newPrice}
                  >
                    {marketplace.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Update as Fixed Price
                      </>
                    )}
                  </Button>
                  
                  {!isAuctionItem && (
                    <Button 
                      onClick={handleSwitchToAuction} 
                      variant="secondary"
                      className="w-full"
                      disabled={marketplace.isPending || !newPrice}
                    >
                      {marketplace.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Gavel className="h-4 w-4 mr-2" />
                          Switch to Auction (7 days)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ManageListingDialog;
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, User } from "lucide-react";
import { useMarketplaceContract } from "@/hooks/useMarketplaceContract";
import { useMarketplaceData, MarketplaceAuction } from "@/hooks/useMarketplaceData";
import { useToast } from "@/hooks/use-toast";
import { useNativeCurrency } from "@/utils/chainUtils";

interface PlaceBidDialogProps {
  auction: MarketplaceAuction;
  children: React.ReactNode;
}

const PlaceBidDialog: React.FC<PlaceBidDialogProps> = ({ auction, children }) => {
  const [open, setOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const marketplace = useMarketplaceContract();
  const { toast } = useToast();
  const nativeCurrency = useNativeCurrency();

  const currentBidValue = parseFloat(auction.currentBid);
  const minBid = currentBidValue > 0 ? currentBidValue + 0.001 : parseFloat(auction.startingPrice);
  const endTime = new Date(auction.endTime);
  const isAuctionActive = endTime > new Date() && auction.isActive;
  const timeRemaining = isAuctionActive ? Math.max(0, endTime.getTime() - Date.now()) : 0;
  
  const formatTimeRemaining = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handlePlaceBid = async () => {
    try {
      const bidValue = parseFloat(bidAmount);
      
      if (isNaN(bidValue) || bidValue <= 0) {
        toast({
          title: "Invalid Bid",
          description: "Please enter a valid bid amount",
          variant: "destructive"
        });
        return;
      }

      if (bidValue < minBid) {
        toast({
          title: "Bid Too Low",
          description: `Minimum bid is ${minBid.toFixed(4)} ${nativeCurrency}`,
          variant: "destructive"
        });
        return;
      }

      if (!isAuctionActive) {
        toast({
          title: "Auction Ended",
          description: "This auction has already ended",
          variant: "destructive"
        });
        return;
      }

      console.log('Placing bid:', {
        auctionId: auction.auctionId,
        bidAmount: bidAmount,
        currentBid: auction.currentBid,
        minBid: minBid
      });

      await marketplace.placeBid(auction.auctionId.toString(), bidAmount);
      
      toast({
        title: "Bid Placed",
        description: `Your bid of ${bidValue.toFixed(4)} ${nativeCurrency} has been submitted`,
      });
      
      setBidAmount('');
      setOpen(false);
    } catch (error: any) {
      console.error("Bid placement error:", error);
      
      let errorMessage = "Failed to place bid";
      if (error?.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for this bid";
      } else if (error?.message?.includes("user rejected")) {
        errorMessage = "Transaction was cancelled";
      } else if (error?.reason) {
        errorMessage = error.reason;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Bid Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Place Bid</DialogTitle>
          <DialogDescription>
            Place your bid on this auction. Make sure you have enough funds to cover your bid.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Auction Status */}
          <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={isAuctionActive ? "default" : "destructive"}>
                {isAuctionActive ? "Active" : "Ended"}
              </Badge>
            </div>
            
            {isAuctionActive && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatTimeRemaining(timeRemaining)} remaining</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Starting Price</span>
              <span className="text-sm font-medium">{parseFloat(auction.startingPrice).toFixed(4)} {nativeCurrency}</span>
            </div>
            
            {currentBidValue > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Bid</span>
                  <span className="text-sm font-medium">{currentBidValue.toFixed(4)} {nativeCurrency}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {auction.highestBidder.slice(0, 6)}...{auction.highestBidder.slice(-4)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Bid Input */}
          {isAuctionActive && (
            <div className="space-y-2">
              <Label htmlFor="bidAmount">Your Bid ({nativeCurrency})</Label>
              <Input
                id="bidAmount"
                type="number"
                step="0.001"
                min={minBid}
                placeholder={`Minimum: ${minBid.toFixed(4)}`}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                disabled={marketplace.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Minimum bid: {minBid.toFixed(4)} {nativeCurrency}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            {isAuctionActive && (
              <Button
                onClick={handlePlaceBid}
                disabled={!bidAmount || parseFloat(bidAmount) < minBid || marketplace.isPending}
                className="flex-1"
              >
                {marketplace.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Placing Bid...
                  </>
                ) : (
                  "Place Bid"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceBidDialog;
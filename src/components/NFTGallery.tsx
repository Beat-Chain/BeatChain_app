import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNFTData } from "@/hooks/useNFTData";
import { useMarketplaceContract } from "@/hooks/useMarketplaceContract";
import { useMarketplaceData } from "@/hooks/useMarketplaceData";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import NFTCard from "./NFTCard";
// Dialog components are now imported directly in NFTCard

interface NFTGalleryProps {
  showUserNFTs?: boolean;
  showCreatedNFTs?: boolean;
  customNFTs?: any[];
  showLoading?: boolean;
  emptyMessage?: string;
}

const NFTGallery: React.FC<NFTGalleryProps> = ({ 
  showUserNFTs = false, 
  showCreatedNFTs = false,
  customNFTs,
  showLoading = false,
  emptyMessage = "No NFTs available"
}) => {
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'list' | 'manage' | 'bid' | null>(null);
  
  const { nfts, loading, getUserNFTs, getCreatedNFTs } = useNFTData();
  const marketplace = useMarketplaceContract();
  const { getListingForNFT, getAuctionForNFT } = useMarketplaceData();
  const { toast } = useToast();

  const togglePlay = (trackId: string) => {
    // Stop all audio elements when switching tracks
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    // Toggle the playing track
    setPlayingTrack(playingTrack === trackId ? null : trackId);
  };

  const displayNFTs = customNFTs 
    ? customNFTs
    : showUserNFTs 
    ? getUserNFTs() 
    : showCreatedNFTs 
    ? getCreatedNFTs() 
    : nfts;

  const buyNFT = async (nft: any, listing: any) => {
    try {
      if (!listing) {
        toast({
          title: "Purchase Failed",
          description: "This NFT is not listed for sale",
          variant: "destructive"
        });
        return;
      }

      console.log("Attempting to buy NFT:", {
        nftContract: nft.contractAddress,
        tokenId: nft.tokenId,
        listingId: listing.listingId,
        formattedPrice: listing.price,
        listing: listing
      });

      // Use the price directly from marketplace data (already formatted as ETH value)
      const priceValue = listing.price;
      console.log("Using price value:", priceValue);

      // Call buyItem with just the listingId - the payment goes as msg.value
      await marketplace.buyItem(listing.listingId.toString(), priceValue);
      
      toast({
        title: "Purchase Initiated",
        description: "Your NFT purchase transaction has been sent"
      });
    } catch (error: any) {
      console.error("Purchase error details:", {
        error: error,
        message: error?.message,
        code: error?.code,
        reason: error?.reason,
        cause: error?.cause
      });
      
      // Better error handling for common issues
      let errorMessage = "Failed to purchase NFT";
      if (error?.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for this purchase";
      } else if (error?.message?.includes("user rejected")) {
        errorMessage = "Transaction was cancelled";
      } else if (error?.message?.includes("Contract not approved")) {
        errorMessage = "NFT is not approved for marketplace transfer";
      } else if (error?.reason) {
        errorMessage = error.reason;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Purchase Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-secondary bg-clip-text text-transparent">
            NFT Music Gallery
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover and collect unique AI-generated music NFTs from creators around the world
          </p>
        </div>

        {loading || showLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading NFTs...</span>
          </div>
        ) : displayNFTs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {customNFTs ? emptyMessage :
               showUserNFTs ? "You don't own any music NFTs yet" : 
               showCreatedNFTs ? "You haven't created any music NFTs yet" : 
               "No music NFTs available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayNFTs.map((track) => {
              const listing = getListingForNFT(track.contractAddress, track.tokenId);
              const auction = getAuctionForNFT(track.contractAddress, track.tokenId);
              
              return (
                <NFTCard
                  key={`${track.contractAddress}-${track.tokenId}`}
                  track={track}
                  listing={listing}
                  auction={auction}
                  showUserActions={showUserNFTs || showCreatedNFTs}
                  onPlay={togglePlay}
                  onBuy={buyNFT}
                  onBid={() => {
                    // Bid functionality is handled by PlaceBidDialog in NFTCard
                  }}
                  onList={() => {
                    // List functionality is handled by ListNFTDialog in NFTCard  
                  }}
                  onManage={() => {
                    // Management functionality is handled by ManageListingDialog in NFTCard
                  }}
                  playingTrack={playingTrack}
                  isLoading={marketplace.isPending}
                />
              );
            })}
          </div>
        )}


        <div className="text-center mt-12">
          <Button variant="neon" size="lg">
            Load More Tracks
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NFTGallery;
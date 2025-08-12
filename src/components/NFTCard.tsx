import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, ExternalLink, Clock, DollarSign, Gavel } from "lucide-react";
import { useState } from "react";
import { NFTData } from "@/hooks/useNFTData";
import { MarketplaceListing, MarketplaceAuction } from "@/hooks/useMarketplaceData";
import { useNativeCurrency } from "@/utils/chainUtils";
import ListNFTDialog from "./ListNFTDialog";
import ManageListingDialog from "./ManageListingDialog";
import PlaceBidDialog from "./PlaceBidDialog";
import AudioPlayer from "./AudioPlayer";

interface NFTCardProps {
  track: NFTData;
  listing?: MarketplaceListing;
  auction?: MarketplaceAuction;
  showUserActions?: boolean;
  onPlay?: (tokenId: string) => void;
  onBuy?: (track: NFTData, listing?: MarketplaceListing) => void;
  onBid?: (auction: MarketplaceAuction) => void;
  onList?: (track: NFTData) => void;
  onManage?: (track: NFTData, listing?: MarketplaceListing, auction?: MarketplaceAuction) => void;
  playingTrack?: string;
  isLoading?: boolean;
}

const NFTCard: React.FC<NFTCardProps> = ({
  track,
  listing,
  auction,
  showUserActions = false,
  onPlay,
  onBuy,
  onBid,
  onList,
  onManage,
  playingTrack,
  isLoading = false
}) => {
  const [audioError, setAudioError] = useState(false);
  const nativeCurrency = useNativeCurrency();
  const cardId = `${track.contractAddress}:${track.tokenId}`;
  
  const isPlaying = playingTrack === cardId;
  const isListed = Boolean(listing);
  const isOnAuction = Boolean(auction);
  const hasMarketActivity = isListed || isOnAuction;

  // Determine price display and market status
  const getMarketInfo = () => {
    if (auction) {
      const currentBid = parseFloat(auction.currentBid);
      const startingPrice = parseFloat(auction.startingPrice);
      const hasActiveBids = currentBid > 0;
      
      return {
        type: 'auction' as const,
        price: hasActiveBids ? auction.currentBid : auction.startingPrice,
        label: hasActiveBids ? 'Current Bid' : 'Starting Price',
        endTime: new Date(auction.endTime),
        isActive: auction.isActive
      };
    }
    
    if (listing) {
      return {
        type: 'fixed' as const,
        price: listing.price,
        label: 'Fixed Price',
        isActive: listing.isActive
      };
    }
    
    return {
      type: 'none' as const,
      price: null,
      label: 'Not Listed'
    };
  };

  const marketInfo = getMarketInfo();

  const renderMarketBadge = () => {
    if (marketInfo.type === 'auction') {
      return (
        <Badge variant="secondary" className="absolute top-3 right-3 bg-orange-500/90 text-white">
          <Gavel className="h-3 w-3 mr-1" />
          Auction
        </Badge>
      );
    }
    
    if (marketInfo.type === 'fixed') {
      return (
        <Badge variant="secondary" className="absolute top-3 right-3 bg-green-500/90 text-white">
          <DollarSign className="h-3 w-3 mr-1" />
          Fixed Price
        </Badge>
      );
    }
    
    return null;
  };

  const renderPriceSection = () => {
    if (marketInfo.type === 'none') {
      return (
        <span className="text-muted-foreground">
          Not Listed
        </span>
      );
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-primary font-bold">
            {parseFloat(marketInfo.price!).toFixed(4)} {nativeCurrency}
          </span>
          <span className="text-xs text-muted-foreground">
            {marketInfo.label}
          </span>
        </div>
        
        {marketInfo.type === 'auction' && marketInfo.endTime && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Ends: {marketInfo.endTime.toLocaleDateString()}
          </div>
        )}
      </div>
    );
  };

  const renderActionButtons = () => {
    if (showUserActions) {
      // User's own NFTs - show management options
      if (hasMarketActivity) {
        return (
          <ManageListingDialog nft={track} listing={listing} auction={auction}>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              disabled={isLoading}
            >
              {marketInfo.type === 'auction' ? 'Manage Auction' : 'Manage Listing'}
            </Button>
          </ManageListingDialog>
        );
      } else {
        return (
          <ListNFTDialog nft={track}>
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              disabled={isLoading}
            >
              List for Sale
            </Button>
          </ListNFTDialog>
        );
      }
    } else {
      // Marketplace view - show buy/bid options
      if (marketInfo.type === 'auction' && auction) {
        return (
          <PlaceBidDialog auction={auction}>
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1"
              disabled={isLoading || !marketInfo.isActive}
            >
              <Gavel className="h-4 w-4 mr-2" />
              {marketInfo.isActive ? 'Place Bid' : 'Auction Ended'}
            </Button>
          </PlaceBidDialog>
        );
      } else if (marketInfo.type === 'fixed' && listing) {
        return (
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={() => onBuy?.(track, listing)}
            disabled={isLoading || !marketInfo.isActive}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            {marketInfo.isActive ? 'Buy Now' : 'Sold'}
          </Button>
        );
      }
      
      return (
        <Button variant="outline" size="sm" className="flex-1" disabled>
          Not Available
        </Button>
      );
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 group">
      <CardContent className="p-0">
        {/* Cover Art */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={track.coverArt}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Play Button Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button
                onClick={() => onPlay?.(cardId)}
                variant="default"
                size="lg"
                className="rounded-full w-16 h-16 bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 ml-1 text-white" />
                )}
              </Button>
            </div>
          )}

          {/* Audio Overlay */}
          {isPlaying && (
            <div className="absolute inset-0 flex items-end p-3">
              <AudioPlayer
                src={track.audioUrl}
                title={track.title}
                artist={track.artist}
                isPlaying={isPlaying}
                onPlayPause={() => onPlay?.(cardId)}
                onError={() => setAudioError(true)}
                variant="overlay"
              />
            </div>
          )}
          
          {/* Badges */}
          <Badge variant="secondary" className="absolute top-3 left-3">
            {track.genre}
          </Badge>
          
          {track.isAIGenerated && (
            <Badge variant="default" className="absolute top-12 left-3">
              AI Generated
            </Badge>
          )}
          
          {renderMarketBadge()}
        </div>

        {/* Track Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 truncate">{track.title}</h3>
          <p className="text-muted-foreground text-sm mb-1 truncate">{track.artist}</p>
          <p className="text-muted-foreground text-xs mb-3">Duration: {track.duration}</p>
          
          {/* Price Section */}
          <div className="mb-4">
            {renderPriceSection()}
          </div>


          {/* Action Buttons */}
          <div className="flex gap-2">
            {renderActionButtons()}
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Token ID */}
          <div className="text-muted-foreground text-xs mt-2 text-center">
            Token #{track.tokenId}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NFTCard;
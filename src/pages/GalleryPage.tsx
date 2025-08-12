import NFTGallery from "@/components/NFTGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, TrendingUp, Music, Users, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { useNFTData } from "@/hooks/useNFTData";
import { useMarketplaceData } from "@/hooks/useMarketplaceData";
import { useAccount } from "wagmi";

const GalleryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { nfts, loading, collections } = useNFTData();
  const { listings, auctions, totalListings, totalAuctions } = useMarketplaceData();
  const { address } = useAccount();

  // Calculate real statistics
  const stats = useMemo(() => {
    const totalTracks = nfts.length;
    const uniqueCreators = new Set(nfts.map(nft => nft.creator.toLowerCase())).size;
    const totalVolume = listings.reduce((sum, listing) => sum + parseFloat(listing.price), 0) +
                       auctions.reduce((sum, auction) => sum + parseFloat(auction.currentBid || auction.startingPrice), 0);
    const totalMinted = nfts.length;

    return {
      totalTracks,
      uniqueCreators,
      totalVolume: totalVolume.toFixed(2),
      totalMinted
    };
  }, [nfts, listings, auctions]);

  // Generate real genre counts from NFT data
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    nfts.forEach(nft => {
      const genre = nft.genre.toLowerCase();
      counts[genre] = (counts[genre] || 0) + 1;
    });
    return counts;
  }, [nfts]);

  // Generate filters with real data
  const filters = useMemo(() => {
    const baseFilters = [
      { id: "all", label: "All Tracks", count: nfts.length },
      { id: "listed", label: "For Sale", count: listings.length },
      { id: "auction", label: "Auctions", count: auctions.length },
    ];

    // Add genre filters
    const genreFilters = Object.entries(genreCounts)
      .filter(([_, count]) => count > 0)
      .map(([genre, count]) => ({
        id: genre,
        label: genre.charAt(0).toUpperCase() + genre.slice(1),
        count
      }));

    return [...baseFilters, ...genreFilters];
  }, [nfts.length, listings.length, auctions.length, genreCounts]);

  // Filter and search NFTs
  const filteredNFTs = useMemo(() => {
    let filtered = nfts;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(nft => 
        nft.title.toLowerCase().includes(query) ||
        nft.artist.toLowerCase().includes(query) ||
        nft.genre.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedFilter !== "all") {
      if (selectedFilter === "listed") {
        filtered = filtered.filter(nft => 
          listings.some(listing => 
            listing.nftContract.toLowerCase() === nft.contractAddress.toLowerCase() &&
            listing.tokenId === nft.tokenId
          )
        );
      } else if (selectedFilter === "auction") {
        filtered = filtered.filter(nft => 
          auctions.some(auction => 
            auction.nftContract.toLowerCase() === nft.contractAddress.toLowerCase() &&
            auction.tokenId === nft.tokenId
          )
        );
      } else {
        // Genre filter
        filtered = filtered.filter(nft => 
          nft.genre.toLowerCase() === selectedFilter
        );
      }
    }

    return filtered;
  }, [nfts, searchQuery, selectedFilter, listings, auctions]);

  // Generate collections data from real collections
  const featuredCollections = useMemo(() => {
    return collections.slice(0, 3).map((collectionAddress, index) => {
      const collectionNFTs = nfts.filter(nft => 
        nft.contractAddress.toLowerCase() === collectionAddress.toLowerCase()
      );
      
      const genres = [...new Set(collectionNFTs.map(nft => nft.genre))];
      const primaryGenre = genres[0] || "Music";
      
      return {
        id: collectionAddress,
        name: `Collection ${index + 1}`,
        description: `A curated collection of ${primaryGenre.toLowerCase()} tracks featuring unique AI-generated compositions.`,
        itemCount: collectionNFTs.length,
        genre: primaryGenre,
        gradient: index === 0 ? "bg-gradient-primary" : 
                 index === 1 ? "bg-gradient-secondary" : 
                 "bg-gradient-to-br from-accent/30 to-primary/30"
      };
    });
  }, [collections, nfts]);

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Header */}
      <section className="py-16 px-4 bg-gradient-hero">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-secondary bg-clip-text text-transparent">
              Music NFT Gallery
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover, collect, and trade unique AI-generated music NFTs from creators around the world.
              Each track is a one-of-a-kind digital asset backed by blockchain technology.
            </p>
          </div>

          {/* Gallery Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 text-center border border-border/50">
              <Music className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalTracks}</div>
              <div className="text-sm text-muted-foreground">Total Tracks</div>
            </div>
            <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 text-center border border-border/50">
              <Users className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.uniqueCreators}</div>
              <div className="text-sm text-muted-foreground">Creators</div>
            </div>
            <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 text-center border border-border/50">
              <TrendingUp className="h-8 w-8 text-primary-glow mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalVolume}</div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
            </div>
            <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 text-center border border-border/50">
              <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalMinted}</div>
              <div className="text-sm text-muted-foreground">NFTs Minted</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 px-4 bg-secondary/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tracks, creators, or genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </Button>
          </div>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Badge
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "secondary"}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedFilter === filter.id 
                    ? "bg-primary hover:bg-primary/90" 
                    : "hover:bg-secondary/80"
                }`}
                onClick={() => setSelectedFilter(filter.id)}
              >
                {filter.label} ({filter.count})
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* NFT Gallery */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Show filtered count */}
          <div className="mb-6 text-center">
            <p className="text-muted-foreground">
              Showing {filteredNFTs.length} of {nfts.length} tracks
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedFilter !== "all" && ` in ${filters.find(f => f.id === selectedFilter)?.label}`}
            </p>
          </div>
          
          {/* Use NFTGallery component with filtered NFTs */}
          <NFTGallery 
            customNFTs={filteredNFTs}
            showLoading={loading}
            emptyMessage={
              searchQuery || selectedFilter !== "all" 
                ? "No NFTs match your search criteria" 
                : "No NFTs available"
            }
          />
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 px-4 bg-secondary/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-primary bg-clip-text text-transparent">
            Featured Album
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCollections.length > 0 ? (
              featuredCollections.map((collection) => (
                <div key={collection.id} className="bg-card/50 backdrop-blur-sm rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300">
                  <div className={`h-48 ${collection.gradient}`}></div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{collection.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {collection.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{collection.itemCount} items</span>
                      <Badge variant="secondary">{collection.genre}</Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground">No collections available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;

import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Music, Palette, TrendingUp, Copy, Loader2, ExternalLink } from "lucide-react";
import { useNFTData } from "@/hooks/useNFTData";
import { useFactoryContract } from "@/hooks/useSmartContracts";
import { useToast } from "@/hooks/use-toast";
import { useActivityData } from "@/hooks/useActivityData";
import NFTGallery from "@/components/NFTGallery";

const ProfilePage = () => {
  const { address, isConnected } = useAccount();
  const { getUserNFTs, getCreatedNFTs, totalSupply } = useNFTData();
  const factory = useFactoryContract();
  const { activities, loading: activityLoading } = useActivityData();
  const { toast } = useToast();

  const userNFTs = getUserNFTs();
  const createdNFTs = getCreatedNFTs();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard"
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-8 text-center">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to view your profile and NFTs
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Profile Header */}
      <section className="py-16 px-4 bg-gradient-hero">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center">
              <User className="h-16 w-16 text-white" />
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
              <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
                <code className="text-sm bg-background/20 px-3 py-1 rounded">
                  {address?.slice(0, 8)}...{address?.slice(-6)}
                </code>
                <Button variant="outline" size="sm" onClick={copyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-muted-foreground mb-6">
                Collect, create, and trade AI-generated music NFTs on BeatChain
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{userNFTs.length}</div>
                  <div className="text-sm text-muted-foreground">Owned NFTs</div>
                </div>
                <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent">{createdNFTs.length}</div>
                  <div className="text-sm text-muted-foreground">Created NFTs</div>
                </div>
                <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary-glow">{factory.creatorCollections.length}</div>
                  <div className="text-sm text-muted-foreground">Collections</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="owned" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="owned" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Owned NFTs ({userNFTs.length})
              </TabsTrigger>
              <TabsTrigger value="created" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Created NFTs ({createdNFTs.length})
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="owned" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Your Music NFT Collection</CardTitle>
                  <CardDescription>
                    Music NFTs you own from various creators on BeatChain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NFTGallery showUserNFTs={true} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="created" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Your Creations</CardTitle>
                  <CardDescription>
                    Music NFTs you've created and minted on BeatChain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NFTGallery showCreatedNFTs={true} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent transactions and interactions on BeatChain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading activity...</span>
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No recent activity found</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Start creating, buying, or selling NFTs to see your activity here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.slice(0, 10).map((activity) => {
                        const getActivityColor = (type: string) => {
                          switch (type) {
                            case 'mint': return 'bg-green-500';
                            case 'list': return 'bg-blue-500';
                            case 'purchase': return 'bg-purple-500';
                            case 'auction_start': return 'bg-orange-500';
                            case 'auction_end': return 'bg-red-500';
                            case 'bid': return 'bg-yellow-500';
                            default: return 'bg-gray-500';
                          }
                        };

                        const getActivityBadge = (type: string) => {
                          switch (type) {
                            case 'mint': return 'Mint';
                            case 'list': return 'List';
                            case 'purchase': return 'Purchase';
                            case 'auction_start': return 'Auction';
                            case 'auction_end': return 'Sold';
                            case 'bid': return 'Bid';
                            default: return 'Activity';
                          }
                        };

                        const timeAgo = (timestamp: number) => {
                          const now = Date.now();
                          const diff = now - timestamp;
                          const hours = Math.floor(diff / (1000 * 60 * 60));
                          const days = Math.floor(hours / 24);
                          
                          if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
                          if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
                          return 'Less than an hour ago';
                        };

                        return (
                          <div key={activity.id} className="flex items-center justify-between p-4 bg-background/20 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`}></div>
                              <div className="flex-1">
                                <p className="font-medium">{activity.title}</p>
                                <p className="text-sm text-muted-foreground">{activity.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {timeAgo(activity.timestamp)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {activity.amount && (
                                <span className="text-sm font-medium text-primary">
                                  {activity.amount}
                                </span>
                              )}
                              <Badge variant="secondary">{getActivityBadge(activity.type)}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => window.open(`https://etherscan.io/tx/${activity.txHash}`, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      
                      {activities.length > 10 && (
                        <div className="text-center pt-4">
                          <Button variant="outline" size="sm">
                            Load More Activity
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
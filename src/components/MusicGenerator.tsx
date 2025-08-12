import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, Wand2, Loader2, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFactoryContract } from "@/hooks/useSmartContracts";
import { useAccount } from "wagmi";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectSeparator } from "@/components/ui/select";
import { isAddress } from "viem";

const MusicGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [generatedTrack, setGeneratedTrack] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [apiKey, setApiKey] = useState<string>("");
  const [selectedAlbum, setSelectedAlbum] = useState<string | "new" | "">("");
  const [albumName, setAlbumName] = useState("");
  const [albumSymbol, setAlbumSymbol] = useState("");
  const { toast } = useToast();
  const { address } = useAccount();
  const factory = useFactoryContract();
 
   useEffect(() => {
     const saved = localStorage.getItem('LOUDLY_API_KEY');
     if (saved) setApiKey(saved);
   }, []);

   // Auto-select newly created collection when transaction is confirmed
   useEffect(() => {
     if (factory.isConfirmed && selectedAlbum === "new" && factory.creatorCollections.length > 0) {
       // Select the most recently created collection (last in the array)
       const newestCollection = factory.creatorCollections[factory.creatorCollections.length - 1];
       setSelectedAlbum(newestCollection);
       toast({
         title: "Album Created!",
         description: "Your new album has been selected. You can now mint your track.",
       });
     }
   }, [factory.isConfirmed, factory.creatorCollections.length]);

   // Refresh collections data when not confirming
   useEffect(() => {
     if (!factory.isCreatingOrMinting && !factory.isConfirmed) {
       // This will trigger a re-render and refresh the collections list
       window.dispatchEvent(new Event('focus'));
     }
   }, [factory.isCreatingOrMinting, factory.isConfirmed]);
 
  const generateMusic = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for your music",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Loudly API key below",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Starting music generation with Loudly API (frontend direct)...', { prompt, duration });
      // Build multipart/form-data per Loudly docs
      const formData = new FormData();
      const safeDuration = Math.max(30, Math.min(Number(duration) || 30, 420));
      formData.append('prompt', prompt.trim());
      formData.append('duration', String(safeDuration));
      
      const response = await fetch('https://soundtracks.loudly.com/api/ai/prompt/songs', {
        method: 'POST',
        headers: {
          'API-KEY': apiKey.trim(),
          'Accept': 'application/json',
        },
        body: formData,
      });

      console.log('API Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('API Success response:', result);
      
      // Handle different possible response structures
      const audioUrl = result.audioUrl || result.music_file_path || result.data?.music_file_path || result.data?.audio_url || result.data?.url || result.data?.download_url || result.data?.file_url;
      if (!audioUrl) {
        console.error('No audio URL found in response:', result);
        throw new Error('No audio file generated - please try again');
      }

      setGeneratedTrack(audioUrl);
      
      // Auto-populate metadata based on prompt
      const trackId = Date.now();
      if (!title) setTitle(`AI Track ${trackId}`);
      if (!artist) setArtist(address?.slice(0, 8) + "..." || "AI Creator");
      if (!genre) setGenre(result.metadata?.genre || "AI Generated");
      
      toast({
        title: "Music Generated!",
        description: "Your AI-generated track is ready to mint as an NFT"
      });
    } catch (error: any) {
      console.error('Music generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate music. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createAlbum = async () => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create an album",
        variant: "destructive",
      });
      return;
    }
    const name = albumName.trim() || "My AI Album";
    let symbol = albumSymbol.trim();
    if (!symbol) {
      const letters = name.replace(/[^A-Za-z]/g, "");
      symbol = (letters || "ALBUM").slice(0, 10).toUpperCase();
    }
    try {
      toast({ title: "Creating Album", description: "Sending transaction..." });
      await factory.createCollection(name, symbol);
      toast({
        title: "Album Created!",
        description: "Your new album is ready. You can now mint your track.",
      });
      // Reset form
      setAlbumName("");
      setAlbumSymbol("");
      // The new collection will appear in the list automatically
      setSelectedAlbum(""); // Reset selection so user can choose the new album
     } catch (e: any) {
       console.error("Create album error:", e);
       toast({
         title: "Album Creation Failed",
         description: e?.shortMessage || e?.message || "Failed to create album.",
         variant: "destructive",
       });
       setSelectedAlbum(""); // Reset selection on error
     }
  };

  const mintAsNFT = async () => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive"
      });
      return;
    }

    if (!generatedTrack || !title || !artist) {
      toast({
        title: "Missing Information",
        description: "Please generate music and fill in all details",
        variant: "destructive"
      });
      return;
    }

    if (!selectedAlbum || !isAddress(selectedAlbum as string)) {
      toast({
        title: "Select an Album",
        description: "Please select an existing album or create a new one before minting.",
        variant: "destructive",
      });
      return;
    }

    setIsMinting(true);
    
    try {
      const collectionAddress = selectedAlbum as `0x${string}`;

      // Prepare metadata
      const metadata = {
        title,
        artist,
        genre,
        duration: BigInt(duration),
        audioUrl: generatedTrack,
        coverArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        createdAt: BigInt(Math.floor(Date.now() / 1000)),
        isAIGenerated: true,
      };

      // Create metadata URI (normally you'd upload to IPFS)
      const metadataUri = `data:application/json,${encodeURIComponent(JSON.stringify({
        name: title,
        description: `AI-generated music: ${prompt}`,
        image: metadata.coverArt,
        audio: generatedTrack,
        attributes: [
          { trait_type: "Artist", value: artist },
          { trait_type: "Genre", value: genre },
          { trait_type: "Duration", value: `${duration}s` },
          { trait_type: "AI Generated", value: "true" }
        ]
      }))}`;

      // Use the same minimum mint price as the factory
      const mintPrice = factory.minimumMintPrice ? 
        (Number(factory.minimumMintPrice) / 1e18).toString() : 
        "0.001";

      await factory.mintNFT(
        collectionAddress as `0x${string}`,
        address as `0x${string}`,
        metadataUri,
        metadata,
        BigInt(500), // 5% royalty
        mintPrice
      );

      toast({
        title: "Minting NFT...",
        description: "Your music NFT is being minted on the blockchain"
      });

    } catch (error: any) {
      console.error('Minting failed:', error);
      toast({
        title: "Minting Failed",
        description: error?.shortMessage || error?.message || "Failed to mint NFT. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsMinting(false);
    }
  };

  const downloadAudio = () => {
    if (!generatedTrack) return;
    
    const link = document.createElement('a');
    link.href = generatedTrack;
    link.download = `beatchain-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Music className="h-6 w-6 text-primary" />
              AI Music Generator
            </CardTitle>
            <CardDescription>
              Describe the music you want to create and AI will compose it for you. When ready, mint it to an Album.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loudly-api-key">Loudly API Key</Label>
              <Input
                id="loudly-api-key"
                type="password"
                placeholder="Paste your Loudly API key"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  localStorage.setItem('LOUDLY_API_KEY', e.target.value);
                }}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">Stored locally in your browser. Required to generate music.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="music-prompt" className="text-sm font-medium">
                Music Description
              </label>
              <Textarea
                id="music-prompt"
                placeholder="Example: Chill lo-fi beats with piano and rain sounds, ambient atmosphere, 120 BPM"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] bg-background/50"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="duration" className="text-sm font-medium">
                  Duration (seconds)
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full p-2 rounded-md bg-background/50 border border-border"
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={90}>90 seconds</option>
                  <option value={120}>120 seconds</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  placeholder="Electronic, Ambient, etc."
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={generateMusic}
            disabled={isGenerating || !prompt.trim() || !apiKey.trim()}
            variant="generate"
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Music...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Music
              </>
            )}
          </Button>

          {generatedTrack && (
            <div className="space-y-4 p-6 bg-secondary/20 rounded-lg border border-border/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Generated Track</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadAudio}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-background/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground mb-2">Prompt: "{prompt}"</p>
                <p className="text-xs text-muted-foreground">Duration: {duration}s</p>
              </div>

              <audio
                controls
                src={generatedTrack}
                className="w-full"
                style={{
                  filter: "hue-rotate(270deg) saturate(1.5)",
                  background: "transparent"
                }}
              >
                Your browser does not support the audio element.
              </audio>
              
              {/* NFT Metadata Form */}
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div className="space-y-2">
                  <Label htmlFor="title">Track Title</Label>
                  <Input
                    id="title"
                    placeholder="My AI Track"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist Name</Label>
                  <Input
                    id="artist"
                    placeholder="Your artist name"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              </div>

              {/* Collection Selection */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="space-y-2">
                  <Label htmlFor="album-select">Select Album/Collection</Label>
                  <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Choose an album or create new" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">
                        <div className="flex items-center gap-2">
                          <span className="text-primary">+</span>
                          Create New Album
                        </div>
                      </SelectItem>
                      {factory.creatorCollections.length > 0 && (
                        <>
                          <SelectSeparator />
                          {factory.creatorCollections.map((collection, index) => (
                            <SelectItem key={collection} value={collection}>
                              Album #{index + 1} ({collection.slice(0, 8)}...)
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAlbum === "new" && (
                  <div className="space-y-4 p-4 bg-card/30 rounded-lg border border-border/50">
                    <h4 className="font-semibold text-sm">Create New Album</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="album-name">Album Name</Label>
                        <Input
                          id="album-name"
                          placeholder="My AI Album"
                          value={albumName}
                          onChange={(e) => setAlbumName(e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="album-symbol">Symbol</Label>
                        <Input
                          id="album-symbol"
                          placeholder="ALBUM"
                          value={albumSymbol}
                          onChange={(e) => setAlbumSymbol(e.target.value.toUpperCase())}
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={createAlbum}
                      disabled={factory.isCreatingOrMinting}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {factory.isCreatingOrMinting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating Album...
                        </>
                      ) : (
                        "Create Album"
                      )}
                    </Button>
                  </div>
                )}
              </div>
              
               <Button 
                 variant="hero" 
                 size="lg" 
                 className="w-full"
                 onClick={mintAsNFT}
                 disabled={isMinting || factory.isCreatingOrMinting || !selectedAlbum || !isAddress(selectedAlbum as string) || selectedAlbum === "new"}
               >
                 {isMinting || factory.isCreatingOrMinting ? (
                   <>
                     <Loader2 className="h-4 w-4 animate-spin mr-2" />
                     Minting...
                   </>
                 ) : !selectedAlbum ? (
                   "Select Album First"
                 ) : selectedAlbum === "new" ? (
                   "Create Album First"
                 ) : (
                   "Mint to Album"
                 )}
               </Button>
              
               {factory.isConfirmed && selectedAlbum && isAddress(selectedAlbum as string) && (
                 <div className="text-center p-2 bg-green-500/20 rounded-lg">
                   <p className="text-sm text-green-400">✅ NFT Minted Successfully!</p>
                 </div>
               )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MusicGenerator;
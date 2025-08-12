import { useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useFactoryContract, formatPrice } from '@/hooks/useSmartContracts';
import { useToast } from '@/hooks/use-toast';

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

const FactoryPage = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();

  useEffect(() => {
    setSEO(
      'BeatChain Factory - On-chain Music NFT',
      'Create collections and mint music NFTs on BeatChain Factory'
    );
  }, []);

  const [collectionName, setCollectionName] = useState('');
  const [collectionSymbol, setCollectionSymbol] = useState('');

  const [collectionAddress, setCollectionAddress] = useState('' as `0x${string}` | '');
  const [to, setTo] = useState('' as `0x${string}` | '');
  const [uri, setUri] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState(30);
  const [audioUrl, setAudioUrl] = useState('');
  const [coverArt, setCoverArt] = useState('');
  const [isAIGenerated, setIsAIGenerated] = useState(true);
  const [royaltyFee, setRoyaltyFee] = useState(500); // 5% in basis points format as uint96 depending on NFT impl
  const [mintPrice, setMintPrice] = useState('0.001');

  const factory = useFactoryContract();

  useEffect(() => {
    if (!to && address) setTo(address as `0x${string}`);
    if (!collectionAddress && factory.creatorCollections[0]) {
      setCollectionAddress(factory.creatorCollections[0]);
    }
  }, [address, factory.creatorCollections, collectionAddress, to]);

  const onCreate = async () => {
    try {
      await factory.createCollection(collectionName, collectionSymbol);
      toast({ title: 'Transaction sent', description: 'Creating collection...' });
    } catch (e: any) {
      toast({ title: 'Create failed', description: e?.shortMessage || e?.message || 'Error', variant: 'destructive' });
    }
  };

  const onMint = async () => {
    if (!collectionAddress) {
      toast({ title: 'Missing collection', description: 'Please select or enter a collection address', variant: 'destructive' });
      return;
    }
    
    console.log('Minting with params:', {
      collection: collectionAddress,
      to: to || address,
      uri,
      title,
      artist,
      duration,
      royaltyFee,
      mintPrice,
      minPrice: factory.minimumMintPrice ? formatPrice(factory.minimumMintPrice) : 'unknown'
    });
    
    try {
      await factory.mintNFT(
        collectionAddress as `0x${string}`,
        (to || address) as `0x${string}`,
        uri,
        {
          title,
          artist,
          genre,
          duration: BigInt(duration),
          audioUrl,
          coverArt,
          createdAt: BigInt(Math.floor(Date.now() / 1000)),
          isAIGenerated,
        },
        BigInt(royaltyFee),
        mintPrice
      );
      toast({ title: 'Transaction sent', description: 'Minting NFT...' });
    } catch (e: any) {
      console.error('Mint error:', e);
      toast({ title: 'Mint failed', description: e?.shortMessage || e?.message || 'Error', variant: 'destructive' });
    }
  };

  const minPrice = useMemo(() => (factory.minimumMintPrice ? formatPrice(factory.minimumMintPrice) : undefined), [factory.minimumMintPrice]);

  return (
    <main className="pt-20 pb-12">
      <section className="px-4 py-8">
        <div className="max-w-5xl mx-auto grid gap-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>BeatChain Factory Interface</CardTitle>
              <CardDescription>Interact with the on-chain factory: create collections and mint NFTs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>Wallet: {isConnected ? address : 'Not connected'}</div>
              <div>Chain ID: {chainId}</div>
              <div>Factory: {factory.contractAddress ?? 'Unsupported on this chain'}</div>
              {factory.minimumMintPrice && (
                <div>Minimum mint price: {formatPrice(factory.minimumMintPrice)}</div>
              )}
              {factory.mintingFee !== undefined && (
                <div>Platform fee (bps): {factory.mintingFee.toString()}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Create Collection</CardTitle>
              <CardDescription>Name and symbol will be used for your ERC-721 collection</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={collectionName} onChange={(e) => setCollectionName(e.target.value)} placeholder="My Beats" />
              </div>
              <div>
                <Label>Symbol</Label>
                <Input value={collectionSymbol} onChange={(e) => setCollectionSymbol(e.target.value)} placeholder="BEAT" />
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={onCreate} disabled={!collectionName || !collectionSymbol || factory.isCreatingOrMinting}>
                  {factory.isCreatingOrMinting ? 'Sending...' : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Mint Music NFT</CardTitle>
              <CardDescription>Provide metadata and send the minimum mint price on your current network</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Collection Address</Label>
                  <Input value={collectionAddress || ''} onChange={(e) => setCollectionAddress(e.target.value as any)} placeholder="0x..." />
                  {factory.creatorCollections.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Your collections: {factory.creatorCollections.join(', ')}</p>
                  )}
                </div>
                <div>
                  <Label>Mint To</Label>
                  <Input value={to || ''} onChange={(e) => setTo(e.target.value as any)} placeholder="0x..." />
                </div>
                <div>
                  <Label>Token URI</Label>
                  <Input value={uri} onChange={(e) => setUri(e.target.value)} placeholder="ipfs://... or https://..." />
                </div>
                <div>
                  <Label>Mint Price ({minPrice ? `min ${minPrice}` : 'enter amount'})</Label>
                  <Input value={mintPrice} onChange={(e) => setMintPrice(e.target.value)} placeholder="0.001" />
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Track title" />
                </div>
                <div>
                  <Label>Artist</Label>
                  <Input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist name" />
                </div>
                <div>
                  <Label>Genre</Label>
                  <Input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Lo-fi / EDM / ..." />
                </div>
                <div>
                  <Label>Duration (seconds)</Label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value || '0', 10))} />
                </div>
                <div>
                  <Label>Audio URL</Label>
                  <Input value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div>
                  <Label>Cover Art URL</Label>
                  <Input value={coverArt} onChange={(e) => setCoverArt(e.target.value)} placeholder="https://..." />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={isAIGenerated} onCheckedChange={setIsAIGenerated} id="ai-gen" />
                  <Label htmlFor="ai-gen">AI Generated</Label>
                </div>
                <div>
                  <Label>Royalty Fee (bps)</Label>
                  <Input type="number" value={royaltyFee} onChange={(e) => setRoyaltyFee(parseInt(e.target.value || '0', 10))} placeholder="500 = 5%" />
                </div>
              </div>
              <div className="flex">
                <Button className="ml-auto" onClick={onMint} disabled={factory.isCreatingOrMinting}>
                  {factory.isCreatingOrMinting ? 'Sending...' : 'Mint'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>All Collections</CardTitle>
              <CardDescription>Deployed across your current network</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {factory.collections.length === 0 ? (
                <p className="text-muted-foreground">No collections found on this chain.</p>
              ) : (
                factory.collections.map((c) => (
                  <div key={c} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                    <span>{c}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default FactoryPage;

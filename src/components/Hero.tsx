import { Button } from "@/components/ui/button";
import { ArrowRight, Music, Palette, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-music.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-8 bg-waveform-primary rounded-full animate-waveform opacity-30" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 left-1/3 w-2 h-12 bg-waveform-secondary rounded-full animate-waveform opacity-40" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/2 w-2 h-6 bg-waveform-primary rounded-full animate-waveform opacity-50" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-2 h-10 bg-waveform-secondary rounded-full animate-waveform opacity-30" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-2 h-8 bg-waveform-primary rounded-full animate-waveform opacity-40" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-float">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            BeatChain
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create AI-generated music and mint it as NFTs on the blockchain. 
            Own your sound, share your creativity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/create">
            <Button variant="hero" size="xl" className="group">
              Start Creating
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/gallery">
            <Button variant="neon" size="xl">
              Explore Gallery
            </Button>
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-card/30 backdrop-blur-sm rounded-lg p-6 border border-border/50">
            <Music className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">AI Music Generation</h3>
            <p className="text-sm text-muted-foreground">
              Transform text prompts into unique musical compositions
            </p>
          </div>
          <div className="bg-card/30 backdrop-blur-sm rounded-lg p-6 border border-border/50">
            <Palette className="h-8 w-8 text-accent mx-auto mb-3" />
            <h3 className="font-semibold mb-2">NFT Artwork</h3>
            <p className="text-sm text-muted-foreground">
              Automatically generate beautiful cover art for your tracks
            </p>
          </div>
          <div className="bg-card/30 backdrop-blur-sm rounded-lg p-6 border border-border/50">
            <Coins className="h-8 w-8 text-primary-glow mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Multi-Chain Support</h3>
            <p className="text-sm text-muted-foreground">
              Deploy on LazAI Chain, Hyperion, and SeiEVM testnet
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
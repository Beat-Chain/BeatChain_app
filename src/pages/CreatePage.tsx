import MusicGenerator from "@/components/MusicGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Headphones, Sparkles, Zap } from "lucide-react";

const CreatePage = () => {
  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Header */}
      <section className="py-16 px-4 bg-gradient-hero">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Create Your Music
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Use the power of AI to transform your musical ideas into reality. 
            Describe your vision and let our advanced models compose unique tracks for you.
          </p>
        </div>
      </section>

      {/* Music Generator */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <MusicGenerator />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-secondary/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-secondary bg-clip-text text-transparent">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <CardTitle>1. Describe Your Music</CardTitle>
                <CardDescription>
                  Enter a detailed prompt describing the style, mood, instruments, and atmosphere you want
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle>2. AI Generation</CardTitle>
                <CardDescription>
                  Our advanced AI models process your prompt and generate a unique musical composition
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>3. Mint & Share</CardTitle>
                <CardDescription>
                  Review your track, mint it as an NFT, and share it with the world
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pro Tips for Better Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card/30 rounded-lg p-6 border border-border/50">
              <h3 className="font-semibold mb-3 text-primary">Be Specific</h3>
              <p className="text-muted-foreground text-sm">
                Include details about genre, tempo, instruments, and mood. 
                "Upbeat electronic dance music with synthesizers and drums at 128 BPM" works better than just "dance music."
              </p>
            </div>
            
            <div className="bg-card/30 rounded-lg p-6 border border-border/50">
              <h3 className="font-semibold mb-3 text-accent">Set the Atmosphere</h3>
              <p className="text-muted-foreground text-sm">
                Describe the feeling or setting. "Relaxing lo-fi beats for studying with rain sounds" 
                gives the AI context for the emotional tone.
              </p>
            </div>
            
            <div className="bg-card/30 rounded-lg p-6 border border-border/50">
              <h3 className="font-semibold mb-3 text-primary-glow">Reference Styles</h3>
              <p className="text-muted-foreground text-sm">
                Mention musical styles or artists as reference points. 
                "Jazz fusion in the style of Miles Davis" or "Ambient techno like Brian Eno."
              </p>
            </div>
            
            <div className="bg-card/30 rounded-lg p-6 border border-border/50">
              <h3 className="font-semibold mb-3 text-accent">Experiment</h3>
              <p className="text-muted-foreground text-sm">
                Try different combinations and don't be afraid to be creative. 
                Mix genres, add unexpected elements, and explore new sonic territories.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreatePage;
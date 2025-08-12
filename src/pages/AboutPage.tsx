import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Music, Brain, Link as ChainIcon, Users, Zap, Shield, Globe, Code } from "lucide-react";

const AboutPage = () => {
  const team = [
    {
      name: "AI Music Engine",
      role: "Core Technology",
      description: "Advanced neural networks trained on millions of musical compositions",
      icon: Brain,
    },
    {
      name: "Blockchain Infrastructure",
      role: "NFT Platform",
      description: "Secure, decentralized ownership and trading on Hyperion & LazAI",
      icon: ChainIcon,
    },
    {
      name: "Community",
      role: "Growing Ecosystem", 
      description: "Join a vibrant community of creators and music enthusiasts worldwide",
      icon: Users,
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate high-quality music in seconds with our optimized AI models"
    },
    {
      icon: Shield,
      title: "Secure Ownership",
      description: "Blockchain-backed NFTs ensure true ownership and provenance"
    },
    {
      icon: Globe,
      title: "Global Marketplace",
      description: "Trade your music NFTs with collectors and fans worldwide"
    },
    {
      icon: Code,
      title: "Open Innovation",
      description: "Built on open standards and interoperable blockchain protocols"
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-hero">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            About BeatChain
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're democratizing music creation by combining the power of AI with blockchain technology. 
            BeatChain empowers anyone to create, own, and trade unique musical compositions 
            without traditional barriers or intermediaries.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 bg-gradient-secondary bg-clip-text text-transparent">
                Our Mission
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Music creation has traditionally been limited to those with expensive equipment, 
                years of training, and industry connections. We believe that musical expression 
                should be accessible to everyone.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                By leveraging cutting-edge AI and blockchain technology, BeatChain removes these 
                barriers and creates a new paradigm where anyone can become a music creator and 
                truly own their digital assets.
              </p>
              <div className="flex gap-4">
                <Badge variant="outline" className="text-primary border-primary">
                  AI-Powered
                </Badge>
                <Badge variant="outline" className="text-accent border-accent">
                  Decentralized
                </Badge>
                <Badge variant="outline" className="text-primary-glow border-primary-glow">
                  Creator-First
                </Badge>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                <Music className="h-24 w-24 text-primary animate-float" />
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center">
                <ChainIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 px-4 bg-secondary/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Powered by Cutting-Edge Technology</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <member.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-accent">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-primary bg-clip-text text-transparent">
            Why Choose BeatChain?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card/30 rounded-xl p-8 border border-border/50 hover:border-accent/50 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Network Information */}
      <section className="py-16 px-4 bg-secondary/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Supported Networks</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  Hyperion Testnet
                </CardTitle>
                <CardDescription>High-performance blockchain for music NFTs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chain ID:</span>
                  <span className="font-mono">133717</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol:</span>
                  <span className="font-mono">tMETIS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="text-green-400">Active</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  LazAI Pre-Testnet
                </CardTitle>
                <CardDescription>Next-generation AI-optimized blockchain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chain ID:</span>
                  <span className="font-mono">133718</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol:</span>
                  <span className="font-mono">LAZAI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="text-green-400">Active</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-glow rounded-full"></div>
                  SeiEVM Testnet
                </CardTitle>
                <CardDescription>Fast and efficient EVM-compatible blockchain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chain ID:</span>
                  <span className="font-mono">1328</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol:</span>
                  <span className="font-mono">SEI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="text-green-400">Active</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-secondary bg-clip-text text-transparent">
            Ready to Create?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your musical journey with BeatChain and bring your creative visions to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/create">Start Creating Music</Link>
            </Button>
            <Button variant="neon" size="lg" asChild>
              <Link to="/gallery">Explore Gallery</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
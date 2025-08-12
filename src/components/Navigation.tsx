import { Button } from "@/components/ui/button";
import { Music, User, Menu } from "lucide-react";
import { useState } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/beatchain-uploads/5b028916-d839-4631-9b92-469db49f64c0.png" 
              alt="BeatChain Logo" 
              className="h-8 w-8"
            />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              BeatChain
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 ml-12">
            <Link 
              to="/" 
              className={`transition-colors ${
                location.pathname === '/' ? 'text-primary' : 'text-foreground hover:text-primary'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/create" 
              className={`transition-colors ${
                location.pathname === '/create' ? 'text-primary' : 'text-foreground hover:text-primary'
              }`}
            >
              Create
            </Link>
            <Link 
              to="/gallery" 
              className={`transition-colors ${
                location.pathname === '/gallery' ? 'text-primary' : 'text-foreground hover:text-primary'
              }`}
            >
              Gallery
            </Link>
            <Link 
              to="/about" 
              className={`transition-colors ${
                location.pathname === '/about' ? 'text-primary' : 'text-foreground hover:text-primary'
              }`}
            >
              About
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <ConnectButton />
            <Link to="/profile">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border/50 p-4">
            <div className="flex flex-col gap-4">
              <Link 
                to="/" 
                className={`py-2 transition-colors ${
                  location.pathname === '/' ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/create" 
                className={`py-2 transition-colors ${
                  location.pathname === '/create' ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Create
              </Link>
              <Link 
                to="/gallery" 
                className={`py-2 transition-colors ${
                  location.pathname === '/gallery' ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link 
                to="/about" 
                className={`py-2 transition-colors ${
                  location.pathname === '/about' ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 border-t border-border/50 flex flex-col gap-2">
                <ConnectButton />
                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

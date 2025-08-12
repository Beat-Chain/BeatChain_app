import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  src: string;
  title: string;
  artist: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onError?: () => void;
  variant?: 'default' | 'overlay';
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title,
  artist,
  isPlaying,
  onPlayPause,
  onError,
  variant = 'default'
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const resolvedSrc = useMemo(() => {
    if (!src) return src;
    try {
      if (src.startsWith('ipfs://')) {
        const path = src.replace('ipfs://', '').replace(/^ipfs\//, '');
        return `https://ipfs.io/ipfs/${path}`;
      }
      if (src.startsWith('/ipfs/') || src.startsWith('ipfs/')) {
        const path = src.replace(/^\/?/, '');
        return `https://ipfs.io/${path}`;
      }
      if (src.startsWith('ar://')) {
        return `https://arweave.net/${src.replace('ar://','')}`;
      }
      return src;
    } catch {
      return src;
    }
  }, [src]);

  // Initialize audio context and analyser
  useEffect(() => {
    if (isPlaying && audioRef.current && !audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      const source = ctx.createMediaElementSource(audioRef.current);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      
      setAudioContext(ctx);
      analyserRef.current = analyser;
    }
  }, [isPlaying, audioContext]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(onError);
        }
        if (audioContext?.state === 'suspended') {
          audioContext.resume();
        }
        startVisualization();
      } else {
        audioRef.current.pause();
        stopVisualization();
      }
    }
  }, [isPlaying]);

  // Beat visualization
  const startVisualization = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) return;

      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient using computed CSS variables (canvas can't use var() directly)
      const rootStyles = getComputedStyle(document.documentElement);
      const getHsl = (name: string) => {
        const v = rootStyles.getPropertyValue(name).trim();
        return v ? `hsl(${v})` : '#16a34a';
      };
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, getHsl('--primary'));
      gradient.addColorStop(0.5, getHsl('--primary-glow'));
      gradient.addColorStop(1, getHsl('--accent'));
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Time update handler
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  // Seek handler
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  // Volume handler
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  // Mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Format time
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopVisualization();
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  return (
    <div className={variant === 'overlay' ? "rounded-lg p-2 space-y-2 bg-transparent" : "bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border/50 space-y-3"}>
      <audio
        ref={audioRef}
        src={resolvedSrc}
        crossOrigin="anonymous"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onError={onError}
        preload="metadata"
      />
      
      {/* Track Info */}
      <div className="text-center">
        <h4 className="font-semibold text-sm truncate">{title}</h4>
        <p className="text-muted-foreground text-xs truncate">{artist}</p>
      </div>

      {/* Beat Visualization */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={280}
          height={60}
          className={variant === 'overlay' ? "w-full h-15 rounded-md bg-transparent" : "w-full h-15 rounded-md bg-secondary/20"}
        />
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex space-x-1">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-muted-foreground/40 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPlayPause}
          className="h-8 w-8 p-0"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>

        <div className="flex-1 space-y-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="h-8 w-8 p-0"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-2">
        <span className="text-xs text-muted-foreground w-12">Volume</span>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
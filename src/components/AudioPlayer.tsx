import { useState, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface Props {
  url: string;
  name: string;
}

export function AudioPlayer({ url, name }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) audioRef.current.pause();
      else audioRef.current.play();
      setPlaying(!playing);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedData = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const skip = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += amount;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const m = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-8 bg-muted/10">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
        <div className="text-center">
          <h3 className="font-medium text-lg truncate">{name}</h3>
          <p className="text-sm text-muted-foreground">Audio file</p>
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={(e) => {
              if (audioRef.current)
                audioRef.current.currentTime = Number(e.target.value);
            }}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => skip(-10)}
            className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={togglePlay}
            className="p-4 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 shadow-sm transition-transform active:scale-95"
          >
            {playing ? (
              <Pause size={24} fill="currentColor" />
            ) : (
              <Play size={24} fill="currentColor" className="ml-1" />
            )}
          </button>
          <button
            onClick={() => skip(10)}
            className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}

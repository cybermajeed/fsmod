import { useRef } from "react";

interface Props {
  url: string;
}

export function VideoPlayer({ url }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-black/95">
      <video
        ref={videoRef}
        src={url}
        controls
        className="w-full h-full max-h-full object-contain"
        autoPlay
      />
    </div>
  );
}

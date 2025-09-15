"use client";
import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export default function VideoPlayer({
  src,
  poster,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-default-skin");
      videoRef.current.appendChild(videoElement);

      const player = videojs(videoElement, {
        controls: true,
        responsive: true,
        fluid: true,
        sources: [
          {
            src: src,
            type: "video/mp4",
          },
        ],
        poster: poster,
      });

      playerRef.current = player;
    }
  }, [src, poster]);

  // Dispose the Video.js player when the component unmounts
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div className={className}>
      <div data-vjs-player>
        <div ref={videoRef} />
      </div>
    </div>
  );
}

"use client";
import MuxPlayer from "@mux/mux-player-react";

interface MuxVideoPlayerProps {
  playbackId: string;
  className?: string;
  poster?: string;
}

export default function MuxVideoPlayer({
  playbackId,
  className = "",
  poster,
}: MuxVideoPlayerProps) {
  return (
    <div className={`mux-player-container ${className}`}>
      <MuxPlayer
        streamType="on-demand"
        playbackId={playbackId}
        poster={poster}
        autoPlay={false}
        muted={false}
        style={
          {
            "--controls-accent-color": "#00ffd5",
            "--media-accent-color": "#00ffd5",
            "--controls-loading-indicator-color": "#00ffd5",
            "--controls-button-hover-background": "#00ffd520",
            "--controls-button-active-background": "#00ffd520",
            aspectRatio: "16 / 9",
          } as React.CSSProperties
        }
      />

      <style jsx>{`
        .mux-player-container mux-player {
          --controls-accent-color: #00ffd5;
          --media-accent-color: #00ffd5;
          --controls-loading-indicator-color: #00ffd5;
          --controls-button-hover-background: rgba(0, 255, 213, 0.1);
          --controls-button-active-background: rgba(0, 255, 213, 0.1);
          --media-range-track-background: rgba(0, 255, 213, 0.3);
          --media-time-range-buffered-color: rgba(0, 255, 213, 0.4);
        }
      `}</style>
    </div>
  );
}

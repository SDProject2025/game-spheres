import MuxVideoPlayer from "../clips/muxVideoPlayer";
import { Clip } from "@/types/Clip";

export default function VideoPlayer({ clip }: { clip: Clip }) {
  if (clip.processingStatus === "ready" && clip.muxPlaybackId) {
    return (
      <MuxVideoPlayer
        playbackId={clip.muxPlaybackId}
        className="w-full h-full"
        poster={clip.thumbnailUrl}
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
      {clip.processingStatus === "preparing" && "Video is still processing..."}
      {clip.processingStatus === "errored" && "Error processing video"}
      {clip.processingStatus === "uploading" && "Upload in progress..."}
    </div>
  );
}

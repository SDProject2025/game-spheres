import MuxVideoPlayer from "../clips/muxVideoPlayer";
import { Clip } from "@/types/Clip";

export default function VideoPlayer({ clip }: { clip: Clip }) {
  if (clip.processingStatus === "ready" && clip.muxPlaybackId) {
    return (
      <div className="w-full h-full">
        <MuxVideoPlayer
          playbackId={clip.muxPlaybackId}
          className="w-full h-full"
          poster={clip.thumbnailUrl}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-sm sm:text-base px-4">
      {clip.processingStatus === "preparing" && "Video is still processing..."}
      {clip.processingStatus === "errored" && "Error processing video"}
      {clip.processingStatus === "uploading" && "Upload in progress..."}
    </div>
  );
}

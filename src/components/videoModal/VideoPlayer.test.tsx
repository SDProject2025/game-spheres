/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import VideoPlayer from "./VideoPlayer";
import MuxVideoPlayer from "../clips/muxVideoPlayer";
import type { Clip } from "@/types/Clip";

jest.mock("../clips/muxVideoPlayer", () =>
  jest.fn(() => <div data-testid="mux-player" />)
);

describe("VideoPlayer Component", () => {
  const baseClip: Clip = {
    id: "clip-1",
    muxPlaybackId: "mux123",
    muxAssetId: "asset-1",
    thumbnailUrl: "http://example.com/thumb.jpg",
    processingStatus: "ready",
    caption: "My awesome clip",
    gameSphereId: "gameSphere-123",
    uploadedBy: "user-123",
    uploadedAt: new Date("2025-09-28T10:00:00Z"),
    duration: 120,
    // views: 200,
    // likes: 15,
    fileSize: 10485760,
    likesCount: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders MuxVideoPlayer when processingStatus is "ready" and muxPlaybackId is present', () => {
    render(<VideoPlayer clip={{ ...baseClip, processingStatus: "ready" }} />);

    const muxPlayer = screen.getByTestId("mux-player");
    expect(muxPlayer).toBeInTheDocument();

    expect(MuxVideoPlayer).toHaveBeenCalledWith(
    {
        playbackId: "mux123",
        className: "w-full h-full",
        "data-testid": "mux-player",
        poster: "http://example.com/thumb.jpg",
    },
    undefined // context argument
    );

  });

  it('renders "Video is still processing..." when status is "preparing"', () => {
    render(<VideoPlayer clip={{ ...baseClip, processingStatus: "preparing" }} />);
    expect(screen.getByText(/Video is still processing/i)).toBeInTheDocument();
    expect(screen.queryByTestId("mux-player")).not.toBeInTheDocument();
  });

  it('renders "Error processing video" when status is "errored"', () => {
    render(<VideoPlayer clip={{ ...baseClip, processingStatus: "errored" }} />);
    expect(screen.getByText(/Error processing video/i)).toBeInTheDocument();
    expect(screen.queryByTestId("mux-player")).not.toBeInTheDocument();
  });

  it('renders "Upload in progress..." when status is "uploading"', () => {
    render(<VideoPlayer clip={{ ...baseClip, processingStatus: "uploading" }} />);
    expect(screen.getByText(/Upload in progress/i)).toBeInTheDocument();
    expect(screen.queryByTestId("mux-player")).not.toBeInTheDocument();
  });

  it("renders an empty container when status is unknown", () => {
    const { container } = render(
      <VideoPlayer clip={{ ...baseClip, processingStatus: "unknown" as any }} />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass(
      "w-full h-full flex items-center justify-center bg-gray-900 text-white"
    );

    expect(screen.queryByTestId("mux-player")).not.toBeInTheDocument();
    expect(screen.queryByText(/Video is still processing/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Error processing video/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Upload in progress/i)).not.toBeInTheDocument();
  });

  it("does not render MuxVideoPlayer if processingStatus is ready but muxPlaybackId is missing", () => {
    const { container } = render(
      <VideoPlayer clip={{ ...baseClip, processingStatus: "ready", muxPlaybackId: "" }} />
    );

    expect(screen.queryByTestId("mux-player")).not.toBeInTheDocument();

    const wrapper = container.firstChild;
    expect(wrapper).toBeInTheDocument();
  });
});

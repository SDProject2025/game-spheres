/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import VideoModal from "./videoModal";
import "@testing-library/jest-dom";
import type { Clip } from "@/types/Clip";

const mockAddComment = jest.fn();
const mockRemoveComment = jest.fn();

jest.mock("@/config/userProvider", () => ({
  useUser: jest.fn(() => ({
    user: { uid: "user123" },
  })),
}));

jest.mock("@/config/gameSpheresContext", () => ({
  useGameSpheresContext: jest.fn(() => ({
    gameSpheres: [{ id: "game1", name: "Game Sphere One" }],
  })),
}));

jest.mock("@/hooks/useClipLikes", () => ({
  useClipLikes: jest.fn(() => ({
    likesCount: 10,
    isLiked: false,
    toggleLike: jest.fn(),
    isLiking: false,
  })),
}));

jest.mock("@/hooks/useSaveStatus", () => ({
  useSaveStatus: jest.fn(() => ({
    saved: false,
    toggleSave: jest.fn(),
  })),
}));

jest.mock("@/hooks/useComments", () => ({
  useComments: jest.fn(() => ({
    comments: [{ id: "c1", text: "Nice clip!" }],
    add: mockAddComment,
    remove: mockRemoveComment,
  })),
}));

// Mock sub-components
jest.mock("../videoModal/VideoPlayer", () => () => (
  <div data-testid="mock-video-player">VideoPlayer Mock</div>
));

jest.mock("../videoModal/LikeButton", () => (props: any) => (
  <button data-testid="mock-like-button" onClick={props.onClick}>
    Like Button
  </button>
));

jest.mock("../videoModal/SaveButton", () => (props: any) => (
  <button data-testid="mock-save-button" onClick={props.onClick}>
    Save Button
  </button>
));

jest.mock("../videoModal/UploaderInfo", () => () => (
  <div data-testid="mock-uploader-info">UploaderInfo Mock</div>
));

jest.mock("../videoModal/CommentsList", () => () => (
  <div data-testid="mock-comments-list">CommentsList Mock</div>
));

jest.mock("../videoModal/CommentInput", () => (props: any) => (
  <button
    data-testid="mock-comment-input"
    onClick={() => props.onAdd("New comment")}
  >
    Add Comment
  </button>
));

// Mock fetch for uploader
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({ userData: { id: "uploader1", name: "Uploader Name" } }),
  })
) as jest.Mock;

describe("VideoModal Component", () => {
  const mockClip: Clip = {
    id: "clip1",
    caption: "Test Clip",
    gameSphereId: "game1",
    uploadedBy: "uploader1",
    uploadedAt: new Date(),

    // Required fields
    fileSize: 1024,
    likesCount: 10,
    muxAssetId: "mux123",
    processingStatus: "ready",
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all main elements", async () => {
    render(<VideoModal clip={mockClip} onClose={mockOnClose} clipSaved={false} />);

    // Title and video player
    expect(screen.getByText("Test Clip")).toBeInTheDocument();
    expect(screen.getByTestId("mock-video-player")).toBeInTheDocument();

    // Like & Save buttons
    expect(screen.getByTestId("mock-like-button")).toBeInTheDocument();
    expect(screen.getByTestId("mock-save-button")).toBeInTheDocument();

    // Comments section
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByTestId("mock-comments-list")).toBeInTheDocument();

    // Uploader info
    await waitFor(() => {
      expect(screen.getByTestId("mock-uploader-info")).toBeInTheDocument();
    });
  });

  it("calls onClose when Escape key is pressed", () => {
    render(<VideoModal clip={mockClip} onClose={mockOnClose} />);
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking outside modal", () => {
    render(<VideoModal clip={mockClip} onClose={mockOnClose} />);
    const backdrop = screen.getByRole("dialog"); // must have role="dialog" in component
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("does not call onClose when clicking inside modal", () => {
    render(<VideoModal clip={mockClip} onClose={mockOnClose} />);
    const modal = screen.getByText("Test Clip").parentElement;
    fireEvent.click(modal!);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("formats game sphere name correctly", () => {
    render(<VideoModal clip={mockClip} onClose={mockOnClose} />);
    expect(screen.getByText("Game Sphere One")).toBeInTheDocument();
  });

  it("adds a comment through CommentInput", () => {
    render(<VideoModal clip={mockClip} onClose={mockOnClose} />);
    const addCommentButton = screen.getByTestId("mock-comment-input");
    fireEvent.click(addCommentButton);

    expect(mockAddComment).toHaveBeenCalledWith("New comment");
  });
});

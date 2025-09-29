/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import NotificationItem from "./notificationItem";
import { useRouter } from "next/navigation";
import { Clip } from "@/types/Clip";
import { Notification } from "@/types/Notification";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("NotificationItem", () => {
  const mockPush = jest.fn();
  const mockHandlePlayClip = jest.fn();

  const baseProfiles = {
    user123: {
      uid: "user123",
      username: "ebra",
      displayName: "ebra2",
      photoURL: "http://example.com/photo.jpg",
      bio: "idk what to say",
      following: [],
      followers: [],
    },
  };

  const mockClip: Clip = {
    id: "clip1",
    caption: "This is a test clip",
    gameSphereId: "game123",
    uploadedBy: "user123",
    uploadedAt: new Date(),
    duration: 120,
    thumbnailUrl: "http://example.com/thumbnail.jpg",
    fileSize: 5000000,
    likesCount: 42,
    muxAssetId: "mux_123456789",
    processingStatus: "ready",
  };

  const baseNotif: Notification = {
    fromUid: "user123",
    toUid:"user456",
    read: false,
    type: "comment",
    commentContent: "Nice clip!",
    createdAt: Date.now(),
    clip: mockClip,
    notificationId: "notification1",
    
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders Problem when notifSender or type is invalid", () => {
    const invalidNotif = { ...baseNotif, fromUid: "missingUser" };
    
    render(
      <NotificationItem
        notif={invalidNotif}
        profiles={{}}
        handlePlayClip={mockHandlePlayClip}
      />
    );

    expect(screen.getByText("Problem")).toBeInTheDocument();
  });

  it("renders a comment notification correctly", () => {
    render(
      <NotificationItem
        notif={baseNotif}
        profiles={baseProfiles}
        handlePlayClip={mockHandlePlayClip}
      />
    );

    expect(screen.getByText("ebra")).toBeInTheDocument();
    expect(screen.getByText(/commented on your post/i)).toBeInTheDocument();
    expect(screen.getByText(/Nice clip!/i)).toBeInTheDocument();
  });

  it("renders a like notification correctly", () => {
    const likeNotif: Notification = {
      ...baseNotif,
      type: "like",
      commentContent: undefined,
    };

    render(
      <NotificationItem
        notif={likeNotif}
        profiles={baseProfiles}
        handlePlayClip={mockHandlePlayClip}
      />
    );

    expect(screen.getByText("ebra")).toBeInTheDocument();
    expect(screen.getByText(/liked your post/i)).toBeInTheDocument();
  });

  it("renders a follow notification correctly", () => {
    const followNotif: Notification = {
      ...baseNotif,
      type: "follow",
      commentContent: undefined,
      clip: undefined,
    };

    render(
      <NotificationItem
        notif={followNotif}
        profiles={baseProfiles}
        handlePlayClip={mockHandlePlayClip}
      />
    );

    expect(screen.getByText("ebra")).toBeInTheDocument();
    expect(screen.getByText(/started following you/i)).toBeInTheDocument();
  });

  it("calls handlePlayClip when a comment notification is clicked", () => {
    render(
      <NotificationItem
        notif={baseNotif}
        profiles={baseProfiles}
        handlePlayClip={mockHandlePlayClip}
      />
    );

    fireEvent.click(screen.getByRole("img"));
    expect(mockHandlePlayClip).toHaveBeenCalledWith(mockClip);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("navigates to profile when follow notification is clicked", () => {
    const followNotif: Notification = {
      ...baseNotif,
      type: "follow",
      clip: undefined,
    };

    render(
      <NotificationItem
        notif={followNotif}
        profiles={baseProfiles}
        handlePlayClip={mockHandlePlayClip}
      />
    );

    fireEvent.click(screen.getByRole("img"));
    expect(mockPush).toHaveBeenCalledWith("/profile/user123");
    expect(mockHandlePlayClip).not.toHaveBeenCalled();
  });

  it("displays formatted date when createdAt is provided", () => {
    render(
      <NotificationItem
        notif={baseNotif}
        profiles={baseProfiles}
        handlePlayClip={mockHandlePlayClip}
      />
    );

    // Just check that a formatted date appears
    const dateText = screen.getByText(/Sep|Oct|Nov|Dec/i);
    expect(dateText).toBeInTheDocument();
  });
});

/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import NotificationList from "./notificationList";
import type { Notification } from "@/types/Notification";
import type { Profile } from "@/types/Profile";
import type { Clip } from "@/types/Clip";

jest.mock("../notificationItem", () => ({
  __esModule: true,
  default: ({ notif }: { notif: Notification }) => (
    <div data-testid="notification-item">
      <span>{notif.type}</span>
      {notif.commentContent && <p>{notif.commentContent}</p>}
      {notif.clip && <p>{notif.clip.caption}</p>}
    </div>
  ),
}));

describe("NotificationList", () => {
  const mockProfiles: Record<string, Profile> = {
    user1: {
      uid: "user1",
      username: "JohnDoe",
      displayName: "John Doe",
      bio: "Test bio",
      following: [],
      followers: [],
      photoURL: "https://example.com/photo.jpg",
    },
  };

  const baseClip: Clip = {
    id: "clip-1",
    caption: "Cool clip",
    duration: 120,
    uploadedAt: new Date(),
    uploadedBy: "user1",
    gameSphereId: "gs1",
    thumbnailUrl: "https://example.com/thumb.png",
    muxPlaybackId: "mux123",
    muxAssetId: "mux-asset-1",
    fileSize: 5000000,
    likesCount: 10,
    processingStatus: "ready",
  };

const baseNotifications: Notification[] = [
  {
    notificationId: "notif-1",
    type: "comment",
    read: false,
    fromUid: "user1",      // ✅ Added
    toUid: "user2",        // ✅ Added
    postId: "post-1",
    commentId: "comment-1",
    createdAt: new Date().getTime(), // ✅ Timestamp as number
  },
  {
    notificationId: "notif-2",
    type: "like",
    read: true,
    fromUid: "user1",      // ✅ Added
    toUid: "user2",        // ✅ Added
    postId: "post-2",
    createdAt: new Date().getTime(), // ✅ Timestamp as number
  },
];


  const mockGetComment = jest.fn();
  const mockGetClip = jest.fn();
  const mockHandlePlayClip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetComment.mockResolvedValue("This is a test comment");
    mockGetClip.mockResolvedValue(baseClip);
  });

  test("renders notifications and enriches data", async () => {
    render(
      <NotificationList
        notifications={baseNotifications}
        profiles={mockProfiles}
        getComment={mockGetComment}
        getClip={mockGetClip}
        handlePlayClip={mockHandlePlayClip}
      />
    );

    // Wait for async useEffect to finish
    await waitFor(() => {
      expect(mockGetClip).toHaveBeenCalledTimes(2);
      expect(mockGetComment).toHaveBeenCalledTimes(1);
    });

    // Both notifications should render
    const notificationItems = screen.getAllByTestId("notification-item");
    expect(notificationItems.length).toBe(2);

    // First notification should contain enriched comment content
    expect(screen.getByText("This is a test comment")).toBeInTheDocument();

    // Clip caption should appear after enrichment
    expect(screen.getAllByText("Cool clip")).toHaveLength(2);//jst assume always has length 2

  });

  test("applies different styles for read vs unread notifications", async () => {
    render(
      <NotificationList
        notifications={baseNotifications}
        profiles={mockProfiles}
        getComment={mockGetComment}
        getClip={mockGetClip}
        handlePlayClip={mockHandlePlayClip}
      />
    );

    await waitFor(() => screen.getAllByTestId("notification-item"));

    const listItems = screen.getAllByRole("listitem");

    // First notification (unread) should have green background
    expect(listItems[0].querySelector("div")).toHaveClass("bg-green-800");

    // Second notification (read) should have gray background
    expect(listItems[1].querySelector("div")).toHaveClass("bg-gray-800");
  });

  test("does not crash if no notifications are provided", () => {
    render(
      <NotificationList
        notifications={[]}
        profiles={mockProfiles}
        getComment={mockGetComment}
        getClip={mockGetClip}
        handlePlayClip={mockHandlePlayClip}
      />
    );

    // The list should simply render empty
    expect(screen.queryByTestId("notification-item")).toBeNull();
  });
});

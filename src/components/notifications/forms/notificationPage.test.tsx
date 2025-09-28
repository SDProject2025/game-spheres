/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NotificationsPage from "./notificationPage";
import type { Notification } from "@/types/Notification";
import type { Profile } from "@/types/Profile";
import type { Clip } from "@/types/Clip";

jest.mock("./notificationList", () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="mock-notification-list" />),
}));

describe("NotificationsPage", () => {
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

  const mockNotifications: Notification[] = [
    {
      notificationId: "notif-1",
      type: "comment",
      read: false,
      fromUid: "user1",
      toUid: "user2",
      postId: "post-1",
      commentId: "comment-1",
      createdAt: Date.now(),
    },
  ];

  const mockGetComment = jest.fn().mockResolvedValue("Test comment");
  const mockGetClip = jest.fn().mockResolvedValue(baseClip);
  const mockHandlePlayClip = jest.fn();
  const mockMarkRead = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the title and 'Mark all as read' button", () => {
    render(
      <NotificationsPage
        notifications={mockNotifications}
        profiles={mockProfiles}
        getComment={mockGetComment}
        getClip={mockGetClip}
        handlePlayClip={mockHandlePlayClip}
        markRead={mockMarkRead}
      />
    );

    expect(screen.getByText("Recent Notifications:")).toBeInTheDocument();

    const button = screen.getByRole("button", { name: /mark all as read/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-green-700");
  });

  test("shows empty state message when there are no notifications", () => {
    render(
      <NotificationsPage
        notifications={[]}
        profiles={mockProfiles}
        getComment={mockGetComment}
        getClip={mockGetClip}
        handlePlayClip={mockHandlePlayClip}
        markRead={mockMarkRead}
      />
    );

    expect(screen.getByText("No notifications yet.")).toBeInTheDocument();
    expect(screen.getByTestId("mock-notification-list")).toBeInTheDocument()
  });

  test("renders NotificationList when notifications are provided", () => {
    const { default: MockNotificationList } = require("./notificationList");

    render(
      <NotificationsPage
        notifications={mockNotifications}
        profiles={mockProfiles}
        getComment={mockGetComment}
        getClip={mockGetClip}
        handlePlayClip={mockHandlePlayClip}
        markRead={mockMarkRead}
      />
    );

    expect(screen.getByTestId("mock-notification-list")).toBeInTheDocument();

    expect(MockNotificationList.mock.calls[0][0]).toEqual({
        notifications: mockNotifications,
        profiles: mockProfiles,
        getComment: mockGetComment,
        getClip: mockGetClip,
        handlePlayClip: mockHandlePlayClip,
    });
    });

  test("calls markRead when 'Mark all as read' button is clicked", () => {
    render(
      <NotificationsPage
        notifications={mockNotifications}
        profiles={mockProfiles}
        getComment={mockGetComment}
        getClip={mockGetClip}
        handlePlayClip={mockHandlePlayClip}
        markRead={mockMarkRead}
      />
    );

    const button = screen.getByRole("button", { name: /mark all as read/i });
    fireEvent.click(button);

    expect(mockMarkRead).toHaveBeenCalledTimes(1);
  });
});

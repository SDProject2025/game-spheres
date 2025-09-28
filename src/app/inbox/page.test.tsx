/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Inbox from "./page";
import { useUser } from "@/config/userProvider";
import { authFetch } from "@/config/authorisation";
import { getDoc, doc } from "firebase/firestore";

beforeAll(() => {
  global.fetch = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

jest.mock("@/config/userProvider", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/config/authorisation", () => ({
  authFetch: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock("@/config/firebaseConfig", () => ({
  auth: {},
  db: {},
  googleProvider: {},
  storage: {},
}));

jest.mock("@/components/notifications/forms/notificationPage", () => ({
  __esModule: true,
  default: jest.fn(
    ({ notifications, profiles, handlePlayClip, markRead }) => (
      <div data-testid="notifications-page">
        <p>Notifications: {notifications.length}</p>
        <p>Profiles: {Object.keys(profiles).length}</p>
        <button
          data-testid="play-clip-button"
          onClick={() =>
            handlePlayClip({ id: "clip1", uploadedAt: new Date() })
          }
        >
          Play Clip
        </button>
        <button data-testid="mark-read-button" onClick={markRead}>
          Mark Read
        </button>
      </div>
    )
  ),
}));

// Mock VideoModal so we can assert it opens and closes
jest.mock("@/components/clips/videoModal", () => ({
  __esModule: true,
  default: jest.fn(({ clip, onClose }) => (
    <div data-testid="video-modal">
      <span>{clip.id}</span>
      <button onClick={onClose}>Close</button>
    </div>
  )),
}));

const mockUseUser = useUser as jest.Mock;
const mockAuthFetch = authFetch as jest.Mock;
const mockGetDoc = getDoc as jest.Mock;
const mockDoc = doc as jest.Mock;

const mockNotifications = [
  { id: "notif1", fromUid: "userA", read: false },
  { id: "notif2", fromUid: "userB", read: true },
];
mockGetDoc.mockResolvedValue({
  exists: () => true,
  data: () => mockProfileData,
});

const mockProfileData = {
  displayName: "John",
  username: "john123",
  bio: "Bio",
  following: [],
  followers: [],
  photoURL: "http://photo.com",
};

describe("Inbox Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.mockImplementation((...args) => args.join("/"));
  });

  it("renders Loading when user is null", () => {
    mockUseUser.mockReturnValue({ user: null });
    render(<Inbox />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("fetches notifications when user is available", async () => {
    mockUseUser.mockReturnValue({ user: { uid: "123" } });

    // First call fetches notifications
    mockAuthFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notificationsData: mockNotifications }),
    });

    render(<Inbox />);

    await waitFor(() => {
      expect(mockAuthFetch).toHaveBeenCalledWith("/api/notifications/get");
    });

    expect(await screen.findByTestId("notifications-page")).toBeInTheDocument();
    expect(screen.getByText("Notifications: 2")).toBeInTheDocument();
  });

  it("fetches profiles for notifications", async () => {
    mockUseUser.mockReturnValue({ user: { uid: "123" } });

    // First fetch returns notifications
    mockAuthFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notificationsData: mockNotifications }),
    });

    // Firestore mock snapshot
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockProfileData,
    });

    render(<Inbox />);

    await waitFor(() => {
      expect(mockGetDoc).toHaveBeenCalledTimes(2); // once for each user
    });
  });

  it("markRead should call update API with unread notifications", async () => {
    mockUseUser.mockReturnValue({ user: { uid: "123" } });

    // Chain all three calls to authFetch
    mockAuthFetch
      // 1. Initial notifications fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notificationsData: mockNotifications }),
      })
      // 2. Mark notifications as read
      .mockResolvedValueOnce({ ok: true })
      // 3. Refresh notifications after marking read
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notificationsData: [] }),
      });

    // Firestore mock so profile fetching doesn't crash
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockProfileData,
    });

    render(<Inbox />);

    // Wait for notifications to appear before clicking
    await waitFor(() => {
      expect(screen.getByText("Notifications: 2")).toBeInTheDocument();
    });

    const unread = mockNotifications.filter((n) => !n.read);

    // Simulate clicking mark read
    fireEvent.click(screen.getByTestId("mark-read-button"));

    // Validate mark read API call
    await waitFor(() => {
      expect(mockAuthFetch).toHaveBeenCalledWith(
        "/api/notifications/update",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(unread),
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("opens and closes VideoModal when playing a clip", async () => {
    mockUseUser.mockReturnValue({ user: { uid: "123" } });

    // Initial notifications fetch
    mockAuthFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notificationsData: mockNotifications }),
    });

    render(<Inbox />);

    await screen.findByTestId("notifications-page");

    // Open the modal
    fireEvent.click(screen.getByTestId("play-clip-button"));
    expect(await screen.findByTestId("video-modal")).toBeInTheDocument();

    // Close the modal
    fireEvent.click(screen.getByText("Close"));

    await waitFor(() => {
      expect(screen.queryByTestId("video-modal")).not.toBeInTheDocument();
    });
  });
});

/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePage from "./profilePage";
import { useUser } from "@/config/userProvider";
import { authFetch } from "@/config/authorisation";

jest.mock("@/config/userProvider", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/config/authorisation", () => ({
  authFetch: jest.fn(),
}));

jest.mock("../profilePicture", () => () => <div data-testid="profile-picture" />);
jest.mock("../profileButton", () => () => <button data-testid="profile-button">Edit</button>);
jest.mock("../followButton", () => (props: any) => (
  <button data-testid="follow-button" onClick={props.isFollowing ? props.handleUnfollowClick : props.handleFollowClick}>
    {props.isFollowing ? "Unfollow" : "Follow"}
  </button>
));
jest.mock("../profileStats", () => (props: any) => (
  <div data-testid={`profile-stat-${props.type}`}>{props.stat}</div>
));
jest.mock("./followList", () => (props: any) => (
  <div data-testid="follow-list">Follow List: {props.type}</div>
));
jest.mock("@/components/clips/gameSphereFilter", () => (props: any) => (
  <div data-testid="gamesphere-filter" />
));
jest.mock("@/components/clips/ClipGrid", () => (props: any) => (
  <div data-testid="clip-grid" />
));

describe("ProfilePage", () => {
  const mockProfile = {
    uid: "user123",
    displayName: "Test User",
    username: "testuser",
    bio: "Test bio",
    followers: ["user456"],
    following: ["user789"],
    photoURL: "https://example.com/photo.png",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders profile correctly", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { uid: "user456" }, loading: false });

    render(<ProfilePage profile={mockProfile} />);

    expect(screen.getByText(mockProfile.displayName)).toBeInTheDocument();
    expect(screen.getByText(`@${mockProfile.username}`)).toBeInTheDocument();
    expect(screen.getByText(mockProfile.bio)).toBeInTheDocument();
    expect(screen.getByTestId("profile-picture")).toBeInTheDocument();
    expect(screen.getByTestId("follow-button")).toBeInTheDocument();
  });

  it("renders 'No profile found' when profile is null", () => {
    (useUser as jest.Mock).mockReturnValue({ user: null, loading: false });

    render(<ProfilePage profile={null} />);

    expect(screen.getByText(/no profile found/i)).toBeInTheDocument();
  });

  it("follow button triggers sendFollow", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: { uid: "user456" }, loading: false });
    (authFetch as jest.Mock).mockResolvedValue({ ok: true });

    render(<ProfilePage profile={mockProfile} />);

    const followButton = screen.getByTestId("follow-button");
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(authFetch).toHaveBeenCalledWith(`/api/profile/${mockProfile.uid}/update/unfollow`, { method: "POST" });
    });

    expect(screen.getByTestId("follow-button").textContent).toBe("Unfollow");
  });

  it("unfollow button triggers sendUnfollow", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: { uid: "user456" }, loading: false });
    (authFetch as jest.Mock).mockResolvedValue({ ok: true });

    const profile = { ...mockProfile, followers: ["user456"] }; // already following

    render(<ProfilePage profile={profile} />);

    const unfollowButton = screen.getByTestId("follow-button");
    fireEvent.click(unfollowButton);

    await waitFor(() => {
      expect(authFetch).toHaveBeenCalledWith(`/api/profile/${profile.uid}/update/unfollow`, { method: "POST" });
    });

    expect(screen.getByTestId("follow-button").textContent).toBe("Follow");
  });

  it("switches tabs when clicking tab buttons", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { uid: "user456" }, loading: false });

    render(<ProfilePage profile={mockProfile} />);

    const savedTab = screen.getByText(/saved/i);
    fireEvent.click(savedTab);

    expect(screen.getByTestId("clip-grid")).toBeInTheDocument();
  });
});

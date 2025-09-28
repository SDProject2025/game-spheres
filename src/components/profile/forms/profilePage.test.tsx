/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePage from "./profilePage";
import { useUser } from "@/config/userProvider";
import { authFetch } from "@/config/authorisation";

// Mock child components
jest.mock("../profilePicture", () => () => <div data-testid="profile-picture">ProfilePicture</div>);
jest.mock("../profileButton", () => () => <div data-testid="profile-button">ProfileButton</div>);
jest.mock("../followButton", () => (props: any) => (
  <button
    data-testid="follow-button"
    onClick={props.isFollowing ? props.handleUnfollowClick : props.handleFollowClick}
  >
    {props.isFollowing ? "Unfollow" : "Follow"}
  </button>
));
jest.mock("../profileStats", () => (props: any) => (
  <div data-testid={`profile-stat-${props.type}`} onClick={props.onClick}>
    {props.stat} {props.type}
  </div>
));
jest.mock("./followList", () => (props: any) => (
  <div data-testid="follow-list">
    FollowList - {props.type} - Count: {props.count}
    <button onClick={() => props.onFetchData(props.type)}>Fetch Data</button>
    <button onClick={props.onClose}>Close</button>
  </div>
));


jest.mock("@/components/clips/gameSphereFilter", () => (props: any) => (
  <div>
    <select
      data-testid="gamesphere-filter"
      value={props.selectedGameSphere}
      onChange={(e) => props.onGameSphereChange(e.target.value)}
    >
      <option value="">All</option>
      <option value="gs1">GS1</option>
    </select>
  </div>
));
jest.mock("@/components/clips/ClipGrid", () => (props: any) => (
  <div data-testid="clip-grid">{props.savedClips ? "Saved Clips" : "Videos"}</div>
));

// Mock hooks
jest.mock("@/config/userProvider", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/config/authorisation", () => ({
  authFetch: jest.fn(),
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: { uid: "user-2" },
      loading: false,
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ users: ["userA", "userB"] }),
    });
  });

  const mockProfile = {
    uid: "user-1",
    displayName: "John Doe",
    username: "johnny",
    photoURL: "/avatar.jpg",
    bio: "Hello world",
    followers: [], // Initially no followers
    following: ["user-3"],
  };

  it("renders 'No profile found' when profile is null", () => {
    render(<ProfilePage profile={null} />);
    expect(screen.getByText("No profile found")).toBeInTheDocument();
  });

  it("renders profile info when profile is provided", () => {
    render(<ProfilePage profile={{ ...mockProfile, uid: "user-2" }} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("@johnny")).toBeInTheDocument();
    expect(screen.getByTestId("profile-picture")).toBeInTheDocument();
    expect(screen.getByTestId("profile-button")).toBeInTheDocument(); // Owner sees profile button
  });

  it("shows FollowButton when viewing another profile", () => {
    render(<ProfilePage profile={mockProfile} />);
    expect(screen.getByTestId("follow-button")).toBeInTheDocument();
    expect(screen.getByText("Follow")).toBeInTheDocument();
  });

  it("handles following a user successfully", async () => {
    (authFetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<ProfilePage profile={mockProfile} />);

    fireEvent.click(screen.getByText("Follow"));
    await waitFor(() => {
      expect(authFetch).toHaveBeenCalledWith(
        `/api/profile/${mockProfile.uid}/update/follow`,
        { method: "POST" }
      );
      expect(screen.getByText("Unfollow")).toBeInTheDocument();
    });
  });

  it("handles unfollowing a user successfully", async () => {
    const followingProfile = { ...mockProfile, followers: ["user-2"] };
    (authFetch as jest.Mock).mockResolvedValue({ ok: true });

    render(<ProfilePage profile={followingProfile} />);

    fireEvent.click(screen.getByText("Unfollow"));
    await waitFor(() => {
      expect(authFetch).toHaveBeenCalledWith(
        `/api/profile/${mockProfile.uid}/update/unfollow`,
        { method: "POST" }
      );
    });
  });

  it("switches between Clips and Saved tabs", () => {
    render(<ProfilePage profile={mockProfile} />);
    expect(screen.getByText("Videos")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Saved"));
    expect(screen.getByText("Saved Clips")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Clips"));
    expect(screen.getByText("Videos")).toBeInTheDocument();
  });

  it("opens and closes FollowList modal", async () => {
    render(<ProfilePage profile={mockProfile} />);
    fireEvent.click(screen.getByTestId("profile-stat-Followers"));

    expect(screen.getByTestId("follow-list")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close"));
    await waitFor(() => {
      expect(screen.queryByTestId("follow-list")).not.toBeInTheDocument();
    });
  });

  it("filters GameSphere and clears filter", () => {
    render(<ProfilePage profile={mockProfile} />);
    const filter = screen.getByTestId("gamesphere-filter");

    fireEvent.change(filter, { target: { value: "gs1" } });
    expect(filter).toHaveValue("gs1");

    fireEvent.click(screen.getByText("Clear filter"));
    expect(filter).toHaveValue("");
  });

it("fetches follow data successfully", async () => {
  render(<ProfilePage profile={mockProfile} />);

  // Open followers modal
  fireEvent.click(screen.getByTestId("profile-stat-Followers"));

  // Simulate calling the fetch function
  fireEvent.click(screen.getByText("Fetch Data"));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/profile/${mockProfile.uid}/followers`
    );
  });
});


it("handles API error when fetching follow data", async () => {
  (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
  render(<ProfilePage profile={mockProfile} />);

  // Open followers modal
  fireEvent.click(screen.getByTestId("profile-stat-Followers"));

  // Simulate calling the fetch function
  fireEvent.click(screen.getByText("Fetch Data"));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/profile/${mockProfile.uid}/followers`
    );
  });
});

});

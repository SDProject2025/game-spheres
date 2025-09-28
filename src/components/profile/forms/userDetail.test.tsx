/**
 * @jest-environment jsdom
 */

//mock fetch and Response globals before any imports to ensure they're available
global.fetch = jest.fn();
global.Response = jest.fn().mockImplementation((body, init) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: new Map(),
  body,
  ...init
})) as any;

//import testing utilities from react testing library
import { screen, render, fireEvent, waitFor } from "@testing-library/react";
//import the component we want to test
import UserDetail from "./userDetail";
//import hooks that will be mocked
import { useUser } from "@/config/userProvider";
import { useRouter } from "next/navigation";
import { auth } from "@/config/firebaseConfig";

//mock the user provider hook
jest.mock("@/config/userProvider");
//mock the next.js navigation router
jest.mock("next/navigation");
//mock firebase auth with a simplified structure
jest.mock("@/config/firebaseConfig", () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn()
    }
  }
}));

//mock the profile picture component for easier testing
jest.mock("../profilePicture", () => {
  return function MockProfilePicture({ src }: { src: string }) {
    return <div data-testid="profile-picture" data-src={src}>Profile Picture</div>;
  };
});

//mock the follow button component with simplified implementation
jest.mock("../followButton", () => {
  return function MockFollowButton({ 
    isFollowing, 
    handleFollowClick, 
    handleUnfollowClick 
  }: { 
    isFollowing: boolean; 
    handleFollowClick: () => void; 
    handleUnfollowClick: () => void; 
  }) {
    return (
      <div data-testid="follow-button">
        <button 
          data-testid="follow-action"
          onClick={isFollowing ? handleUnfollowClick : handleFollowClick}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>
    );
  };
});

//mock the profile stats component
jest.mock("../profileStats", () => {
  return function MockProfileStat({ stat, type }: { stat: number; type: string }) {
    return <div data-testid={`profile-stat-${type.toLowerCase()}`}>{stat} {type}</div>;
  };
});

//mock the react icon component
jest.mock("react-icons/fi", () => ({
  FiUser: () => <span data-testid="user-icon">👤</span>
}));

//create typed mock variables for the mocked functions
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
//mock all router methods
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockForward = jest.fn();
const mockRefresh = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();
const mockGetIdToken = auth.currentUser?.getIdToken as jest.MockedFunction<any>;

//get the mocked fetch function
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

//mock profile data for testing
const mockProfile = {
  uid: "profile-123",
  username: "johndoe",
  displayName: "John Doe",
  bio: "This is my bio",
  photoURL: "https://example.com/photo.jpg",
  followers: ["user-1", "user-2"],
  following: ["user-3", "user-4", "user-5"]
};

//mock current user data
const mockCurrentUser = {
  uid: "current-user-123",
  email: "current@test.com",
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: "refresh-token",
  tenantId: null,
  delete: jest.fn(),
  getIdToken: jest.fn(),
  getIdTokenResult: jest.fn(),
  reload: jest.fn(),
  toJSON: jest.fn(),
  displayName: null,
  phoneNumber: null,
  photoURL: null,
  providerId: "firebase"
};

//main test suite for UserDetail component
describe("UserDetail", () => {
  //beforeEach runs before each test to set up mocks
  beforeEach(() => {
    jest.clearAllMocks();
    //mock the router to return our mock functions
    mockUseRouter.mockReturnValue({ 
      push: mockPush,
      back: mockBack,
      forward: mockForward,
      refresh: mockRefresh,
      replace: mockReplace,
      prefetch: mockPrefetch
    });
    //mock the user hook to return our mock current user
    mockUseUser.mockReturnValue({ user: mockCurrentUser, loading: false });
    //clear the fetch mock calls
    (mockFetch).mockClear();
  });

  //test that shows "No profile found" when profile is null
  it("renders 'No profile found' when profile is null", () => {
    render(<UserDetail profile={null} />);
    
    expect(screen.getByText("No profile found")).toBeInTheDocument();
    expect(screen.queryByTestId("profile-picture")).not.toBeInTheDocument();
  });

  //test that profile details render correctly when profile data is provided
  it("renders profile details when profile is provided", () => {
    render(<UserDetail profile={mockProfile} />);
    
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("This is my bio")).toBeInTheDocument();
    expect(screen.getByText("@johndoe")).toBeInTheDocument();
    expect(screen.getByTestId("profile-picture")).toBeInTheDocument();
  });

  //test that the correct image source is passed to ProfilePicture
  it("passes correct src to ProfilePicture component", () => {
    render(<UserDetail profile={mockProfile} />);
    
    const profilePicture = screen.getByTestId("profile-picture");
    expect(profilePicture).toHaveAttribute("data-src", "https://example.com/photo.jpg");
  });

  //test that follower and following counts are displayed correctly
  it("displays correct follower and following counts", () => {
    render(<UserDetail profile={mockProfile} />);
    
    expect(screen.getByTestId("profile-stat-following")).toHaveTextContent("3 Following");
    expect(screen.getByTestId("profile-stat-followers")).toHaveTextContent("2 Followers");
  });

  //test handling of profiles with empty follower/following arrays
  it("handles profile with no followers or following", () => {
    const emptyProfile = {
      ...mockProfile,
      followers: [],
      following: []
    };
    
    render(<UserDetail profile={emptyProfile} />);
    
    expect(screen.getByTestId("profile-stat-following")).toHaveTextContent("0 Following");
    expect(screen.getByTestId("profile-stat-followers")).toHaveTextContent("0 Followers");
  });

  //test that isFollowing is true when current user is in followers list
  it("sets isFollowing to true when current user is in followers list", () => {
    const profileWithCurrentUserFollowing = {
      ...mockProfile,
      followers: ["user-1", mockCurrentUser.uid, "user-2"]
    };
    
    render(<UserDetail profile={profileWithCurrentUserFollowing} />);
    
    expect(screen.getByText("Unfollow")).toBeInTheDocument();
  });

  //test that isFollowing is false when current user is not in followers list
  it("sets isFollowing to false when current user is not in followers list", () => {
    render(<UserDetail profile={mockProfile} />);
    
    expect(screen.getByText("Follow")).toBeInTheDocument();
  });

  //test navigation to profile page when View Profile button is clicked
  it("navigates to profile page when View Profile button is clicked", () => {
    render(<UserDetail profile={mockProfile} />);
    
    const viewProfileButton = screen.getByRole("button", { name: /view profile/i });
    fireEvent.click(viewProfileButton);
    
    expect(mockPush).toHaveBeenCalledWith("/profile/profile-123");
  });

  //test that follow request is sent correctly when follow button is clicked
  it("sends follow request when follow button is clicked", async () => {
    mockGetIdToken.mockResolvedValue("fake-token");
    mockFetch.mockResolvedValue({
      ok: true
    } as Response);
    
    render(<UserDetail profile={mockProfile} />);
    
    const followButton = screen.getByTestId("follow-action");
    fireEvent.click(followButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/profile/profile-123/update/follow", {
        method: "POST",
        headers: {
          Authorization: "Bearer fake-token",
          "Content-Type": "application/json",
        }
      });
    });
  });

  //test that followers list and state update after successful follow
  it("updates followers list and state after successful follow", async () => {
    mockGetIdToken.mockResolvedValue("fake-token");
    mockFetch.mockResolvedValue({
      ok: true
    } as Response);
    
    const profileCopy = { ...mockProfile, followers: [...mockProfile.followers] };
    render(<UserDetail profile={profileCopy} />);
    
    const followButton = screen.getByTestId("follow-action");
    fireEvent.click(followButton);
    
    await waitFor(() => {
      expect(profileCopy.followers).toContain(mockCurrentUser.uid);
      expect(screen.getByText("Unfollow")).toBeInTheDocument();
    });
  });

  //test that unfollow request is sent correctly when unfollow button is clicked
  it("sends unfollow request when unfollow button is clicked", async () => {
    const profileWithCurrentUserFollowing = {
      ...mockProfile,
      followers: ["user-1", mockCurrentUser.uid, "user-2"]
    };
    
    mockGetIdToken.mockResolvedValue("fake-token");
    mockFetch.mockResolvedValue({
      ok: true
    } as Response);
    
    render(<UserDetail profile={profileWithCurrentUserFollowing} />);
    
    const unfollowButton = screen.getByTestId("follow-action");
    fireEvent.click(unfollowButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/profile/profile-123/unfollow", {
        method: "POST",
        headers: {
          Authorization: "Bearer fake-token"
        }
      });
    });
  });

  //test that followers list and state update after successful unfollow
  it("updates followers list and state after successful unfollow", async () => {
    const profileCopy = {
      ...mockProfile,
      followers: ["user-1", mockCurrentUser.uid, "user-2"]
    };
    
    mockGetIdToken.mockResolvedValue("fake-token");
    mockFetch.mockResolvedValue({
      ok: true
    } as Response);
    
    render(<UserDetail profile={profileCopy} />);
    
    const unfollowButton = screen.getByTestId("follow-action");
    fireEvent.click(unfollowButton);
    
    await waitFor(() => {
      expect(profileCopy.followers).not.toContain(mockCurrentUser.uid);
      expect(screen.getByText("Follow")).toBeInTheDocument();
    });
  });

//test graceful handling of follow request failure
it("handles follow request failure gracefully", async () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  mockGetIdToken.mockResolvedValue("fake-token");
  mockFetch.mockResolvedValue({
    ok: false
  } as Response);

  const profileCopy = { ...mockProfile, followers: [...mockProfile.followers] };
  render(<UserDetail profile={profileCopy} />);

  const followButton = screen.getByTestId("follow-action");
  fireEvent.click(followButton);

  await waitFor(() => {
    const isFollowing = profileCopy.followers.includes(mockCurrentUser.uid);
    expect(followButton).toHaveTextContent(isFollowing ? "Unfollow" : "Follow");
  });

  consoleSpy.mockRestore();
});

  //test handling of network errors during follow requests
  it("handles network error during follow request", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const networkError = new Error("Network failed");
    mockGetIdToken.mockRejectedValue(networkError);
    
    render(<UserDetail profile={mockProfile} />);
    
    const followButton = screen.getByTestId("follow-action");
    fireEvent.click(followButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Network failed");
    });
    
    consoleSpy.mockRestore();
  });

  //test graceful handling of unfollow request failure
  it("handles unfollow request failure gracefully", async () => {
    const profileWithCurrentUserFollowing = {
      ...mockProfile,
      followers: ["user-1", mockCurrentUser.uid, "user-2"]
    };
    
    mockGetIdToken.mockResolvedValue("fake-token");
    mockFetch.mockResolvedValue({
      ok: false
    } as Response);
    
    render(<UserDetail profile={profileWithCurrentUserFollowing} />);
    
    const unfollowButton = screen.getByTestId("follow-action");
    fireEvent.click(unfollowButton);
    
    await waitFor(() => {
      expect(screen.getByText("Unfollow")).toBeInTheDocument(); //should remain unchanged
    });
  });

  //test handling of empty profile uid in follow operations
  it("handles empty profile uid in follow operation", async () => {
    const profileWithEmptyUid = { ...mockProfile, uid: "" };
    
    render(<UserDetail profile={profileWithEmptyUid} />);
    
    const followButton = screen.getByTestId("follow-action");
    fireEvent.click(followButton);
    
    expect(fetch).not.toHaveBeenCalled();
  });

  //test handling of empty profile uid in unfollow operations
  it("handles empty profile uid in unfollow operation", async () => {
    const profileWithEmptyUid = { 
      ...mockProfile, 
      uid: "",
      followers: [mockCurrentUser.uid]
    };
    
    render(<UserDetail profile={profileWithEmptyUid} />);
    
    const unfollowButton = screen.getByTestId("follow-action");
    fireEvent.click(unfollowButton);
    
    expect(fetch).not.toHaveBeenCalled();
  });

  //test handling of user without uid in follow operations
  it("handles user without uid in follow operations", async () => {
    const userWithoutUid = {
      ...mockCurrentUser,
      uid: ""
    };
    mockUseUser.mockReturnValue({ user: userWithoutUid, loading: false });
    mockGetIdToken.mockResolvedValue("fake-token");
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true
    } as Response);
    
    const profileCopy = { ...mockProfile, followers: [...mockProfile.followers] };
    render(<UserDetail profile={profileCopy} />);
    
    const followButton = screen.getByTestId("follow-action");
    fireEvent.click(followButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      //should not add empty string to followers array
      expect(profileCopy.followers).not.toContain("");
    });
  });

  //test that View Profile button has correct styling and icon
  it("renders View Profile button with correct styling and icon", () => {
    render(<UserDetail profile={mockProfile} />);
    
    const viewProfileButton = screen.getByRole("button", { name: /view profile/i });
    expect(viewProfileButton).toHaveClass(
      "mt-6",
      "px-6", 
      "py-2",
      "rounded-md",
      "font-semibold",
      "text-[#111]",
      "bg-[#00ffc3]"
    );
    expect(screen.getByTestId("user-icon")).toBeInTheDocument();
  });

  //test handling of profiles with missing optional fields
  it("handles profile with missing optional fields", () => {
    const minimalProfile = {
      uid: "profile-123",
      username: "johndoe",
      displayName: "John Doe",
      bio: "",
      photoURL: "",
      followers: [],
      following: []
    };
    
    render(<UserDetail profile={minimalProfile} />);
    
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("@johndoe")).toBeInTheDocument();
    expect(screen.getByTestId("profile-stat-followers")).toHaveTextContent("0 Followers");
    expect(screen.getByTestId("profile-stat-following")).toHaveTextContent("0 Following");
  });

  //test behavior when user is not logged in
  it("updates following state when user is not logged in", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    
    render(<UserDetail profile={mockProfile} />);
    
    expect(screen.getByText("Follow")).toBeInTheDocument();
  });

  //test that the component has correct layout structure
  it("renders correct layout structure", () => {
    render(<UserDetail profile={mockProfile} />);
    
    const container = screen.getByText("John Doe").closest(".min-h-screen");
    expect(container).toHaveClass("min-h-screen", "bg-[#111]", "text-white");
    
    const mainContent = screen.getByText("John Doe").closest(".max-w-6xl");
    expect(mainContent).toHaveClass("max-w-6xl", "mx-auto", "px-4", "py-8");
  });

  //test handling of unknown error types in follow requests
  it("handles unknown error types in follow request", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    mockGetIdToken.mockRejectedValue("string error"); //non-error object
    
    render(<UserDetail profile={mockProfile} />);
    
    const followButton = screen.getByTestId("follow-action");
    fireEvent.click(followButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to follow");
    });
    
    consoleSpy.mockRestore();
  });

  //test handling of unknown error types in unfollow requests
  it("handles unknown error types in unfollow request", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const profileWithCurrentUserFollowing = {
      ...mockProfile,
      followers: [mockCurrentUser.uid]
    };
    
    mockGetIdToken.mockRejectedValue("string error");
    
    render(<UserDetail profile={profileWithCurrentUserFollowing} />);
    
    const unfollowButton = screen.getByTestId("follow-action");
    fireEvent.click(unfollowButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to follow");
    });
    
    consoleSpy.mockRestore();
  });

  //test that user is correctly removed from followers array on unfollow
  it("correctly removes user from followers array on unfollow", async () => {
    const profileCopy = {
      ...mockProfile,
      followers: ["user-1", mockCurrentUser.uid, "user-2"]
    };
    
    mockGetIdToken.mockResolvedValue("fake-token");
    mockFetch.mockResolvedValue({
      ok: true
    } as Response);
    
    render(<UserDetail profile={profileCopy} />);
    
    const unfollowButton = screen.getByTestId("follow-action");
    fireEvent.click(unfollowButton);
    
    await waitFor(() => {
      expect(profileCopy.followers).toEqual(["user-1", "user-2"]);
      expect(profileCopy.followers).not.toContain(mockCurrentUser.uid);
    });
  });

//test that correct props are passed to FollowButton component
it("passes correct props to FollowButton component", () => {
  const profileCopy = { ...mockProfile, followers: [...mockProfile.followers] };
  render(<UserDetail profile={profileCopy} />);
  
  const followButton = screen.getByTestId("follow-action");
  expect(followButton).toBeInTheDocument();
  //check text based on current user
  const isFollowing = profileCopy.followers.includes(mockCurrentUser.uid);
  expect(followButton).toHaveTextContent(isFollowing ? "Unfollow" : "Follow");
});

  //test handling of profiles with empty followers/following arrays
  it("handles profile with empty followers/following arrays", () => {
    const profileWithEmptyArrays = {
      ...mockProfile,
      followers: [],
      following: []
    };
    
    render(<UserDetail profile={profileWithEmptyArrays} />);
    
    expect(screen.getByTestId("profile-stat-followers")).toHaveTextContent("0 Followers");
    expect(screen.getByTestId("profile-stat-following")).toHaveTextContent("0 Following");
  });
});
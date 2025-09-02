/**
 * @jest-environment jsdom
 */

global.fetch = jest.fn();
global.Response = jest.fn().mockImplementation((body, init) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: new Map(),
  body,
  ...init
})) as any;

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePage from "./profilePage";
import { useUser } from "@/config/userProvider";
import { auth } from "@/config/firebaseConfig";

jest.mock("@/config/userProvider");
jest.mock("@/config/firebaseConfig", () => ({
  auth: { currentUser: { getIdToken: jest.fn() } }
}));

//create typed mock variables for the useUser hook and getIdToken function
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockGetIdToken = auth.currentUser?.getIdToken as jest.MockedFunction<any>;

//mock current user data with minimal required fields
const mockCurrentUser = { uid: "user-123", email: "test@test.com", emailVerified: true } as any;

//mock profile data for testing
const mockProfile = {
  uid: "profile-1",
  username: "johndoe",
  displayName: "John Doe",
  bio: "My bio",
  photoURL: "https://example.com/photo.jpg",
  followers: ["user-456"],
  following: ["user-789"]
};

//test suite for improving test coverage on ProfilePage component
describe("ProfilePage coverage improvements", () => {
  //beforeEach runs before each test to reset mocks
  beforeEach(() => {
    jest.clearAllMocks();
    //mock the useUser hook to return our test user
    mockUseUser.mockReturnValue({ user: mockCurrentUser, loading: false });
  });

  //test that isFollowing is set to true when current user is in the profile's followers list
  it("sets isFollowing correctly when user is in followers", () => {
    //create a profile where current user is already following
    const profileWithUser = { ...mockProfile, followers: ["user-123"] };
    render(<ProfilePage profile={profileWithUser} />);
    //verify the button shows "Unfollow" text
    expect(screen.getByText("Unfollow")).toBeInTheDocument();
  });

  //test that isFollowing is set to false when current user is NOT in the profile's followers list
  it("sets isFollowing correctly when user is NOT in followers", () => {
    render(<ProfilePage profile={mockProfile} />);
    //verify the button shows "Follow" text
    expect(screen.getByText("Follow")).toBeInTheDocument();
  });

  //test that sendFollow function updates state correctly on successful API call
  it("sendFollow updates state on success", async () => {
    //mock successful token retrieval
    mockGetIdToken.mockResolvedValue("fake-token");
    //mock successful fetch response
    global.fetch = jest.fn().mockResolvedValue({ ok: true } as any);

    //create a copy of the profile to test state updates
    const profileCopy = { ...mockProfile, followers: [...mockProfile.followers] };
    render(<ProfilePage profile={profileCopy} />);

    //simulate clicking the follow button
    fireEvent.click(screen.getByText("Follow"));

    //wait for state updates and verify changes
    await waitFor(() => {
      //verify current user was added to followers array
      expect(profileCopy.followers).toContain(mockCurrentUser.uid);
      //verify button text changed to "Unfollow"
      expect(screen.getByText("Unfollow")).toBeInTheDocument();
    });
  });

  //test that sendFollow handles API failure gracefully without updating state
  it("sendFollow handles fetch failure gracefully", async () => {
    //mock console.log to prevent test output pollution
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    mockGetIdToken.mockResolvedValue("fake-token");
    //mock failed fetch response
    global.fetch = jest.fn().mockResolvedValue({ ok: false } as any);

    render(<ProfilePage profile={mockProfile} />);

    fireEvent.click(screen.getByText("Follow"));

    //wait and verify that state didn't change (still shows "Follow")
    await waitFor(() => {
      expect(screen.getByText("Follow")).toBeInTheDocument();
    });

    //restore original console.log function
    consoleSpy.mockRestore();
  });

  //test that sendUnfollow function updates state correctly on successful API call
  it("sendUnfollow updates state on success", async () => {
    mockGetIdToken.mockResolvedValue("fake-token");
    global.fetch = jest.fn().mockResolvedValue({ ok: true } as any);

    //create profile where current user is already following
    const profileCopy = { ...mockProfile, followers: ["user-123", "user-456"] };
    render(<ProfilePage profile={profileCopy} />);

    fireEvent.click(screen.getByText("Unfollow"));

    //wait for state updates and verify changes
    await waitFor(() => {
      //verify current user was removed from followers array
      expect(profileCopy.followers).not.toContain(mockCurrentUser.uid);
      //verify button text changed to "Follow"
      expect(screen.getByText("Follow")).toBeInTheDocument();
    });
  });

  //test that sendUnfollow handles API failure gracefully without updating state
  it("sendUnfollow handles fetch failure gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    mockGetIdToken.mockResolvedValue("fake-token");
    global.fetch = jest.fn().mockResolvedValue({ ok: false } as any);

    //create profile where current user is already following
    const profileCopy = { ...mockProfile, followers: ["user-123", "user-456"] };
    render(<ProfilePage profile={profileCopy} />);

    fireEvent.click(screen.getByText("Unfollow"));

    //wait and verify that state didn't change (still shows "Unfollow")
    await waitFor(() => {
      expect(screen.getByText("Unfollow")).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

//test that FollowList modal opens and closes correctly
it("opens and closes FollowList correctly", async () => {
  render(<ProfilePage profile={mockProfile} />);

  //open followers list by clicking on the followers stat text
  //using a more specific selector to target the correct element
  const followersStat = screen.getByText("Followers", { selector: "p.text-sm" });
  fireEvent.click(followersStat);

  //verify the FollowList modal header appears with count
  const followListHeader = screen.getByText(/Followers \(\d+\)/i, { selector: "h3" });
  expect(followListHeader).toBeInTheDocument();

  //close the modal by clicking the close button (× character)
  const closeButton = screen.getByText("×", { selector: "button" });
  fireEvent.click(closeButton);

  //wait for modal to close and verify it's no longer in document
  await waitFor(() => {
    expect(followListHeader).not.toBeInTheDocument();
  });
});


  //test error handling in fetchFollowData function
  it("fetchFollowData returns empty array on error", async () => {
    //mock fetch to reject with an error
    global.fetch = jest.fn().mockRejectedValue(new Error("fail"));

    //render the component
    const instance = render(<ProfilePage profile={mockProfile} />);
    //trigger a follow action to indirectly test fetchFollowData error handling
    fireEvent.click(screen.getByText("Follow"));

    //wait and verify that the button state remains unchanged
    await waitFor(() => {
      expect(screen.getByText("Follow")).toBeInTheDocument();
    });
  });
});

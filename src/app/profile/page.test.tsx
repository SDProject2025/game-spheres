/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MyProfile from "./page";
import { useUser } from "@/config/userProvider";

jest.mock("@/config/userProvider", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/components/profile/forms/profilePage", () => ({
  __esModule: true,
  default: jest.fn(({ profile }) => (
    <div data-testid="profile-page">
      {profile ? <span>{profile.username}</span> : <span>No Profile</span>}
    </div>
  )),
}));

describe("MyProfile Component", () => {
  const mockUseUser = useUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("renders loading state when user or profile is loading", () => {
    mockUseUser.mockReturnValue({ user: null, loading: true });

    render(<MyProfile />);

    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
  });

  it("renders ProfilePage with null when fetch returns non-OK", async () => {
    mockUseUser.mockReturnValue({ user: { uid: "user123" }, loading: false });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<MyProfile />);

    expect(await screen.findByTestId("profile-page")).toBeInTheDocument();
    expect(screen.getByText("No Profile")).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith("/api/profile?uid=user123");
  });

  it("renders ProfilePage with null on network error", async () => {
    mockUseUser.mockReturnValue({ user: { uid: "user123" }, loading: false });

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<MyProfile />);

    expect(await screen.findByTestId("profile-page")).toBeInTheDocument();
    expect(screen.getByText("No Profile")).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith("/api/profile?uid=user123");
  });

  it("does not call fetch if user.uid is missing", async () => {
    mockUseUser.mockReturnValue({ user: {}, loading: false });

    render(<MyProfile />);

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});

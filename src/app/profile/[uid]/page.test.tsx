/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ViewProfile from "./page";
import { useParams } from "next/navigation";

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/components/profile/forms/profilePage", () => ({
  __esModule: true,
  default: jest.fn(({ profile }) => (
    <div data-testid="profile-page">
      {profile ? <span>{profile.username}</span> : <span>No Profile</span>}
    </div>
  )),
}));

describe("ViewProfile Component", () => {
  const mockUseParams = useParams as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(); // Mock fetch globally
  });

  it("renders loading state initially", () => {
    mockUseParams.mockReturnValue({ uid: "123" });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userData: { username: "JohnDoe" } }),
    });

    render(<ViewProfile />);

    // Should show loading state first
    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
  });

  it("fetches user data and renders ProfilePage on success", async () => {
    mockUseParams.mockReturnValue({ uid: "123" });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userData: { username: "JohnDoe" } }),
    });

    render(<ViewProfile />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/profile?uid=123");
    });

    // Verify that ProfilePage was rendered with the fetched data
    expect(screen.getByTestId("profile-page")).toBeInTheDocument();
    expect(screen.getByText("JohnDoe")).toBeInTheDocument();
  });

  it("renders ProfilePage with null profile if fetch fails", async () => {
    mockUseParams.mockReturnValue({ uid: "123" });

    // Simulate fetch returning a non-ok response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<ViewProfile />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/profile?uid=123");
    });

    // ProfilePage should still render, but with null data
    expect(screen.getByTestId("profile-page")).toBeInTheDocument();
    expect(screen.getByText("No Profile")).toBeInTheDocument();
  });

  it("renders ProfilePage with null profile on network error", async () => {
    mockUseParams.mockReturnValue({ uid: "123" });

    // Simulate fetch throwing an error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<ViewProfile />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/profile?uid=123");
    });

    // Should render with null profile
    expect(screen.getByTestId("profile-page")).toBeInTheDocument();
    expect(screen.getByText("No Profile")).toBeInTheDocument();
  });
});

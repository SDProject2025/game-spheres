/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditProfilePage from "./page";
import { useUser } from "@/config/userProvider";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authFetch } from "@/config/authorisation";

jest.mock("react-hot-toast", () => ({
  toast: {
    error: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/config/userProvider", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/config/authorisation", () => ({
  authFetch: jest.fn(),
}));

jest.mock("@/components/profile/forms/EditProfileForm", () => ({
  __esModule: true,
  default: jest.fn(({ userId, onSave }) => (
    <div data-testid="edit-profile-form">
      <p>Editing user: {userId}</p>
      <button
        data-testid="save-button"
        onClick={() =>
          onSave("New Display", "newusername", "New Bio", "http://photo.url")
        }
      >
        Save
      </button>
    </div>
  )),
}));

describe("EditProfilePage Component", () => {
  const mockReplace = jest.fn();
  const mockAlert = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    global.alert = mockAlert; // Mock alert
  });

  it("renders loading state when user is undefined", () => {
    (useUser as jest.Mock).mockReturnValue({ user: undefined });

    render(<EditProfilePage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to /auth and shows toast when user is null", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });

    render(<EditProfilePage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "You must be signed in to edit your profile."
      );
      expect(mockReplace).toHaveBeenCalledWith("/auth");
    });
  });

  it("renders EditProfileForm when user exists", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: { uid: "user123" } });

    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId("edit-profile-form")).toBeInTheDocument();
      expect(screen.getByText("Editing user: user123")).toBeInTheDocument();
    });
  });

  it("calls authFetch and redirects on successful save", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: { uid: "user123" } });

    (authFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    render(<EditProfilePage />);

    const saveButton = await screen.findByTestId("save-button");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(authFetch).toHaveBeenCalledWith("/api/profile/update", {
        method: "POST",
        body: JSON.stringify({
          uid: "user123",
          displayName: "New Display",
          username: "newusername",
          bio: "New Bio",
          photoURL: "http://photo.url",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(mockReplace).toHaveBeenCalledWith("/profile");
    });
  });

  it("alerts when authFetch throws an error", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: { uid: "user123" } });

    (authFetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<EditProfilePage />);

    const saveButton = await screen.findByTestId("save-button");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith("Ya done fucked it");
    });
  });
});

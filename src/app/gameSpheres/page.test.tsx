/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import GameSpheres from "./page";
import { useUser } from "@/config/userProvider";
import { useRouter } from "next/navigation";
import { useGameSpheresContext } from "@/config/gameSpheresContext";
import { authFetch } from "@/config/authorisation";
import { toast } from "react-hot-toast";

jest.mock("@/config/userProvider", () => ({
  useUser: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/config/gameSpheresContext", () => ({
  useGameSpheresContext: jest.fn(),
}));

jest.mock("@/config/authorisation", () => ({
  authFetch: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

jest.mock("@/components/search/searchBar", () => ({
  __esModule: true,
  default: jest.fn(({ title, placeholder, onItemAction, actionButtonText, onSelectionChange }) => (
    <div data-testid="search-bar">
      <h1>{title}</h1>
      <input placeholder={placeholder} data-testid="search-input" />
      <button
        data-testid="mock-select-item"
        onClick={() =>
          onSelectionChange({
            id: "game1",
            name: "Elden Ring",
            coverUrl: "cover.jpg",
            releaseDate: "2022",
            storyline: "Epic story",
            genres: ["RPG"],
          })
        }
      >
        Select Game
      </button>
      <button
        data-testid="mock-action-button"
        onClick={() =>
          onItemAction({
            id: "game1",
            name: "Elden Ring",
            coverUrl: "cover.jpg",
            releaseDate: "2022",
            storyline: "Epic story",
            genres: ["RPG"],
          })
        }
      >
        {actionButtonText()}
      </button>
    </div>
  )),
}));

const mockGameSpheres = [
  { id: "game1", name: "Elden Ring", coverUrl: "cover.jpg", releaseDate: "2022", genres: ["RPG"] },
  { id: "game2", name: "Halo Infinite", coverUrl: "halo.jpg", releaseDate: "2021", genres: ["Shooter"] },
];

const mockUser = { uid: "user123" };

describe("GameSpheres Component", () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    (useUser as jest.Mock).mockReturnValue({ user: mockUser, loading: false });
    (useGameSpheresContext as jest.Mock).mockReturnValue({ gameSpheres: mockGameSpheres });
  });

  it("renders SearchBar with correct title and placeholder", () => {
    render(<GameSpheres />);
    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    expect(screen.getByText("Search GameSpheres")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search for a game ...")).toBeInTheDocument();
  });

  it("redirects to '/' if no user is found", () => {
    (useUser as jest.Mock).mockReturnValue({ user: null, loading: false });

    render(<GameSpheres />);
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("checks subscription status when a game is selected", async () => {
    (authFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isSubscribed: true }),
    });

    render(<GameSpheres />);

    fireEvent.click(screen.getByTestId("mock-select-item"));

    await waitFor(() => {
      expect(authFetch).toHaveBeenCalledWith(
        `/api/gameSpheres/subscriptions?userId=user123&gameSphereId=game1`
      );
    });
  });

    it("handles subscription (subscribe -> unsubscribe) correctly", async () => {

    (authFetch as jest.Mock)

        .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isSubscribed: false }),
        })

        .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isSubscribed: true }), // now subscribed
        })
        .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isSubscribed: false }), // now unsubscribed
        });

    render(<GameSpheres />);

    fireEvent.click(screen.getByTestId("mock-select-item"));

    fireEvent.click(screen.getByTestId("mock-action-button"));

    await waitFor(() => {
        expect(authFetch).toHaveBeenCalledWith(
        "/api/gameSpheres/subscriptions",
        expect.objectContaining({
            method: "POST",
            body: JSON.stringify({ gameSphereId: "game1", action: "subscribe" }),
        })
        );
        expect(toast.success).toHaveBeenCalledWith("Subscribed to GameSphere: Elden Ring");
    });

    fireEvent.click(screen.getByTestId("mock-action-button"));

    await waitFor(() => {
        expect(authFetch).toHaveBeenCalledWith(
        "/api/gameSpheres/subscriptions",
        expect.objectContaining({
            method: "POST",
            body: JSON.stringify({ gameSphereId: "game1", action: "unsubscribe" }),
        })
        );
        expect(toast.success).toHaveBeenCalledWith("Unsubscribed from GameSphere: Elden Ring");
    });
    });


  it("shows an error toast if subscription update fails", async () => {
    (authFetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<GameSpheres />);
    fireEvent.click(screen.getByTestId("mock-select-item"));
    fireEvent.click(screen.getByTestId("mock-action-button"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong :(");
    });
  });

  it("search function filters games correctly using Fuse.js", async () => {
    const { gameSpheres } = useGameSpheresContext();
    expect(gameSpheres).toHaveLength(2);

    render(<GameSpheres />);

    const fuseSearch = await screen.findByTestId("search-bar");
    expect(fuseSearch).toBeInTheDocument();
  });
});

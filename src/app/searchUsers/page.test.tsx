/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchUsers from "./page";

beforeAll(() => {
  global.fetch = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock("@/components/search/searchItem", () => ({
  __esModule: true,
  default: jest.fn(({ searchTitle, imageUrl }) => (
    <div data-testid="search-item">
      <span>{searchTitle}</span>
      <img src={imageUrl} alt="user avatar" />
    </div>
  )),
}));

jest.mock("@/components/profile/forms/userDetail", () => ({
  __esModule: true,
  default: jest.fn(({ profile }) => (
    <div data-testid="user-detail">
      <p>{profile.username}</p>
      <p>{profile.displayName}</p>
    </div>
  )),
}));

// --- Mock SearchBar ---
const mockSearchBar = jest.fn();
jest.mock("@/components/search/searchBar", () => ({
  __esModule: true,
  default: jest.fn(({ placeholder, title, searchFunction, renderItem, renderDetails }) => {
    mockSearchBar({ placeholder, title, searchFunction, renderItem, renderDetails });
    return (
      <div data-testid="search-bar">
        <h1>{title}</h1>
        <input placeholder={placeholder} data-testid="search-input" />
        <button data-testid="search-button" onClick={() => searchFunction("testQuery")}>
          Search
        </button>
      </div>
    );
  }),
}));

describe("searchUsers Component", () => {
  const mockUserData = {
    uid: "123",
    photoURL: "http://example.com/avatar.jpg",
    username: "john_doe",
    displayName: "John Doe",
    bio: "Hello world!",
    followers: [],
    following: [],
    conversations: [],
    messages: [],
    posts: 5,
  };

  it("renders the search bar with correct title and placeholder", () => {
    render(<SearchUsers />);

    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    expect(screen.getByText("Search Users")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search for other users...")).toBeInTheDocument();
  });

  it("calls fetch with correct query and returns users", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [mockUserData] }),
    });

    render(<SearchUsers />);

    const button = screen.getByTestId("search-button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/profile/search?query=testQuery");
    });
  });

  it("returns empty array and logs error when fetch fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<SearchUsers />);

    const button = screen.getByTestId("search-button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error searching:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it("passes renderItem and renderDetails to SearchBar", () => {
    render(<SearchUsers />);

    expect(mockSearchBar).toHaveBeenCalledWith(
      expect.objectContaining({
        placeholder: "Search for other users...",
        title: "Search Users",
        searchFunction: expect.any(Function),
        renderItem: expect.any(Function),
        renderDetails: expect.any(Function),
      })
    );
  });
});

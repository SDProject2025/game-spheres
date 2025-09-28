/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "./page";
import { useUser } from "@/config/userProvider";

jest.mock("@/config/userProvider", () => ({
  useUser: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/components/clips/ClipGrid", () => ({
  __esModule: true,
  default: jest.fn(({ userFilter, gameSphereFilter, sortBy }) => (
    <div data-testid="clip-grid">
      <p>UserFilter: {userFilter || "none"}</p>
      <p>GameSphereFilter: {gameSphereFilter || "none"}</p>
      <p>SortBy: {sortBy}</p>
    </div>
  )),
}));

jest.mock("@/components/clips/gameSphereFilter", () => ({
  __esModule: true,
  default: jest.fn(({ selectedGameSphere, onGameSphereChange, className }) => (
    <div data-testid="game-sphere-filter" className={className}>
      <span>Selected: {selectedGameSphere || "none"}</span>
      <button onClick={() => onGameSphereChange("Sphere1")}>Set Sphere1</button>
    </div>
  )),
}));

jest.mock("@/components/clips/sortDropdown", () => ({
  __esModule: true,
  default: jest.fn(({ currentSort, onSortChange }) => (
    <div data-testid="sort-dropdown">
      <span>Current Sort: {currentSort}</span>
      <button onClick={() => onSortChange("latest")}>Sort by Latest</button>
    </div>
  )),
}));

const mockUseUser = useUser as jest.Mock;

describe("Home Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({ user: { uid: "user123" } });
  });

  it("renders correctly with default state", () => {
    render(<Home />);

    expect(screen.getByText("GameSpheres")).toBeInTheDocument();

    expect(screen.getByTestId("sort-dropdown")).toHaveTextContent("popular24h");

    expect(screen.getByTestId("clip-grid")).toHaveTextContent("UserFilter: user123");
    expect(screen.getByTestId("clip-grid")).toHaveTextContent("GameSphereFilter: none");
    expect(screen.getByTestId("clip-grid")).toHaveTextContent("SortBy: popular24h");
  });

  it("changes sort option when SortDropdown button is clicked", () => {
    render(<Home />);

    const sortButton = screen.getByText("Sort by Latest");
    fireEvent.click(sortButton);

    expect(screen.getByTestId("sort-dropdown")).toHaveTextContent("latest");
    expect(screen.getByTestId("clip-grid")).toHaveTextContent("SortBy: latest");
  });

   it("sets selected game sphere when GameSphereFilter button is clicked", () => {
  render(<Home />);

  const sphereButtons = screen.getAllByText("Set Sphere1");
  fireEvent.click(sphereButtons[0]);

  const sphereFilters = screen.getAllByTestId("game-sphere-filter");

  expect(sphereFilters[0]).toHaveTextContent("Selected: Sphere1");

  expect(screen.getByTestId("clip-grid")).toHaveTextContent("GameSphereFilter: Sphere1");

  expect(screen.getByText("Clear filter")).toBeInTheDocument();
});

    it("clears the game sphere filter when Clear filter button is clicked", () => {
    render(<Home />);

    const sphereButtons = screen.getAllByText("Set Sphere1");

    fireEvent.click(sphereButtons[0]);

    const sphereFilters = screen.getAllByTestId("game-sphere-filter");
    expect(sphereFilters[0]).toHaveTextContent("Selected: Sphere1");

    fireEvent.click(screen.getByText("Clear filter"));

    expect(sphereFilters[0]).toHaveTextContent("Selected: none");
    expect(screen.getByTestId("clip-grid")).toHaveTextContent("GameSphereFilter: none");
    });


  it("renders two GameSphereFilter components", () => {
    render(<Home />);
    const filters = screen.getAllByTestId("game-sphere-filter");
    expect(filters).toHaveLength(2); // Two instances in the layout
  });

  it("renders ClipGrid with dynamic key changes when state updates", () => {
    const { rerender } = render(<Home />);

    const initialKey = screen.getByTestId("clip-grid").parentElement?.getAttribute("key");
    expect(screen.getByTestId("clip-grid")).toHaveTextContent("SortBy: popular24h");

    fireEvent.click(screen.getByText("Sort by Latest"));
    rerender(<Home />);

    expect(screen.getByTestId("clip-grid")).toHaveTextContent("SortBy: latest");
  });
});

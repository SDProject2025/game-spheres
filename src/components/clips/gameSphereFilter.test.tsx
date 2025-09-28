/**
 * @jest-environment jsdom
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import GameSphereFilter from "./gameSphereFilter";
import { useGameSpheresContext } from "@/config/gameSpheresContext";

jest.mock("@/config/gameSpheresContext");
jest.mock("@/config/firebaseConfig", () => ({
  auth: {},
  db: {},
  googleProvider: {},
  storage: {},
}));

const mockGameSpheres = [
  { id: "1", name: "League of Legends" },
  { id: "2", name: "Valorant" },
  { id: "3", name: "Apex Legends" },
];

describe("GameSphereFilter Component", () => {
  const mockOnGameSphereChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useGameSpheresContext as jest.Mock).mockReturnValue({
      gameSpheres: mockGameSpheres,
    });
  });

  const renderComponent = (selectedGameSphere = "") => {
    render(
      <GameSphereFilter
        selectedGameSphere={selectedGameSphere}
        onGameSphereChange={mockOnGameSphereChange}
      />
    );
  };

  it("renders input with placeholder when nothing is selected", () => {
    renderComponent();

    const input = screen.getByPlaceholderText("Search GameSpheres...");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Select a GameSphere...");
  });

  it("shows selected game sphere name when provided", () => {
    renderComponent("2");

    const input = screen.getByPlaceholderText("Search GameSpheres...");
    expect(input).toHaveValue("Valorant");
  });

  it("opens the dropdown when input is focused", () => {
    renderComponent();

    const input = screen.getByPlaceholderText("Search GameSpheres...");
    fireEvent.focus(input);

    expect(screen.getByText("League of Legends")).toBeInTheDocument();
    expect(screen.getByText("Valorant")).toBeInTheDocument();
    expect(screen.getByText("Apex Legends")).toBeInTheDocument();
  });

  it("filters the list based on search query", () => {
    renderComponent();

    const input = screen.getByPlaceholderText("Search GameSpheres...");
    fireEvent.focus(input);

    fireEvent.change(input, { target: { value: "Valorant" } });

    expect(screen.getByText("Valorant")).toBeInTheDocument();
    expect(screen.queryByText("League of Legends")).not.toBeInTheDocument();
    expect(screen.queryByText("Apex Legends")).not.toBeInTheDocument();
  });

  it("shows 'no results found' message when search yields nothing", () => {
    renderComponent();

    const input = screen.getByPlaceholderText("Search GameSpheres...");
    fireEvent.focus(input);

    fireEvent.change(input, { target: { value: "Overwatch" } });

    expect(
      screen.getByText(/No GameSpheres found for/i)
    ).toBeInTheDocument();
  });

  it("calls onGameSphereChange and closes dropdown when option is clicked", () => {
    renderComponent();

    const input = screen.getByPlaceholderText("Search GameSpheres...");
    fireEvent.focus(input);

    const option = screen.getByText("Valorant");
    fireEvent.click(option);

    expect(mockOnGameSphereChange).toHaveBeenCalledWith("2");
    expect(screen.queryByText("League of Legends")).not.toBeInTheDocument();
  });

  it("closes dropdown when clicking outside", async () => {
    renderComponent();

    const input = screen.getByPlaceholderText("Search GameSpheres...");
    fireEvent.focus(input);

    expect(screen.getByText("League of Legends")).toBeInTheDocument();

    fireEvent.mouseDown(document.body); // click outside

    await waitFor(() => {
      expect(screen.queryByText("League of Legends")).not.toBeInTheDocument();
    });
  });
});

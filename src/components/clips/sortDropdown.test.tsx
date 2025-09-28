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
import SortDropdown, { SortOption } from "./sortDropdown";

describe("SortDropdown Component", () => {
  const mockOnSortChange = jest.fn();

  const renderComponent = (currentSort: SortOption = "recent") =>
    render(
      <SortDropdown
        currentSort={currentSort}
        onSortChange={mockOnSortChange}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default label", () => {
    renderComponent("recent");

    expect(screen.getByText("Recent")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders the correct label when current sort is popularity", () => {
    renderComponent("popular24h");

    expect(screen.getByText("Popular • 24 Hours")).toBeInTheDocument();
  });

  it("opens and closes the dropdown when clicked", () => {
    renderComponent();

    const toggleButton = screen.getByRole("button");

    // Initially closed
    expect(
      screen.queryByText("Popularity")
    ).not.toBeInTheDocument();

    // Open dropdown
    fireEvent.click(toggleButton);
    expect(screen.getByText("Popularity")).toBeInTheDocument();

    // Close dropdown
    fireEvent.click(toggleButton);
    expect(
      screen.queryByText("Popularity")
    ).not.toBeInTheDocument();
  });

  it("shows popularity submenu on hover and hides it when mouse leaves", async () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button"));

    const popularitySection = screen.getByText("Popularity").closest("div")!;

    // Hover to show submenu
    fireEvent.mouseEnter(popularitySection);
    expect(await screen.findByText("24 Hours")).toBeInTheDocument();

    // Mouse leave to hide submenu
    fireEvent.mouseLeave(popularitySection);

    await waitFor(() => {
      expect(screen.queryByText("24 Hours")).not.toBeInTheDocument();
    });
  });

  it("calls onSortChange when selecting a popularity option", async () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button"));

    fireEvent.mouseEnter(screen.getByText("Popularity").closest("div")!);

    const option = await screen.findByText("24 Hours");
    fireEvent.click(option);

    expect(mockOnSortChange).toHaveBeenCalledWith("popular24h");
  });

    it("calls onSortChange when selecting a time option", () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button")); // open dropdown

    const options = screen.getAllByText("Recent");

    // index 0 = main button label
    // index 1 = dropdown option
    fireEvent.click(options[1]);

    expect(mockOnSortChange).toHaveBeenCalledWith("recent");
    });


  it("closes dropdown when clicking outside", () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button")); // open dropdown

    expect(screen.getByText("Popularity")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByText("Popularity")).not.toBeInTheDocument();
  });
});

/** 
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import ProfileStat from "./profileStats";
import "@testing-library/jest-dom";

// test suite for the ProfileStat component
describe("ProfileStat", () => {
  // test that the component displays the correct stat number and type text
  it("renders the stat and type correctly", () => {
    // render the component with 42 followers as test data
    render(<ProfileStat stat={42} type="Followers" />);
    
    // check that the number 42 is displayed
    expect(screen.getByText("42")).toBeInTheDocument();
    // check that the word "followers" is displayed (case insensitive)
    expect(screen.getByText(/followers/i)).toBeInTheDocument();
  });

  // test that the component doesn't have clickable styles when no onClick is provided
  it("does not have clickable styles when onClick is not provided", () => {
    // render without an onClick handler
    render(<ProfileStat stat={10} type="Posts" />);
    // find the container div by looking for the stat text and getting its parent
    const container = screen.getByText("10").closest("div");

    // verify the container doesn't have cursor-pointer class (no hand cursor)
    expect(container).not.toHaveClass("cursor-pointer");
    // verify it doesn't have hover color change effect
    expect(container).not.toHaveClass("hover:text-[#00ffc3]");
  });

  // test that clickable styles are added when onClick is provided
  it("adds clickable styles when onClick is provided", () => {
    // render with an onClick handler (using a jest mock function)
    render(<ProfileStat stat={5} type="Likes" onClick={jest.fn()} />);
    // find the container div
    const container = screen.getByText("5").closest("div");

    // verify the container has cursor-pointer class (shows hand cursor on hover)
    expect(container).toHaveClass("cursor-pointer");
    // verify it has hover color change to teal
    expect(container).toHaveClass("hover:text-[#00ffc3]");
  });

  // test that the onClick handler is actually called when the component is clicked
  it("calls onClick when clicked", () => {
    // create a mock function to track if it gets called
    const mockClick = jest.fn();
    // render with the mock function as onClick handler
    render(<ProfileStat stat={100} type="Followers" onClick={mockClick} />);

    // find the container div and assert it exists with the ! operator
    const container = screen.getByText("100").closest("div")!;
    // simulate a click event on the container
    fireEvent.click(container);

    // verify the mock function was called exactly once
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});

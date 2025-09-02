/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import NeonButton from "./neonButton";
import "@testing-library/jest-dom";

//test suite for the NeonButton component
describe("NeonButton", () => {
  //test that the button renders with the text content passed as children (dk what else to test here)
  it("renders with children text", () => {
    //render the button with "Click Me" as its child text
    render(<NeonButton>Click Me</NeonButton>);
    //find the button by its role and check that it contains the text
    expect(
      screen.getByRole("button", { name: /click me/i })
    ).toBeInTheDocument();
  });

  //test that the button defaults to type="button" when no type prop is provided
  it("uses default type=button", () => {
    // render without specifying a type prop
    render(<NeonButton>Default</NeonButton>);
    //checkk that the button has type="button" attribute by default
    expect(screen.getByRole("button", { name: /default/i })).toHaveAttribute(
      "type",
      "button"
    );
  });

  //test that the button acc respects a custom type prop when provided
  it("respects the type prop", () => {
    //render withh type="submit" explicitly set
    render(<NeonButton type="submit">Submit</NeonButton>);
    //verify the button has type="submit" attribute
    expect(screen.getByRole("button", { name: /submit/i })).toHaveAttribute(
      "type",
      "submit"
    );
  });

  //test that the onClick handler is called when the button is clicked
  it("calls onClick when clicked", () => {
    //create a mock function to track clicks
    const mockClick = jest.fn();
    //render with the mock function as onClick handler
    render(<NeonButton onClick={mockClick}>Press</NeonButton>);
    //find the button and simulate a click event
    fireEvent.click(screen.getByRole("button", { name: /press/i }));
    //verify the mock function was called exactly once
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  //need to check up on this and figure out how to disable properly, if necessary
  //   it("does not call onClick when disabled", () => {
  //     const mockClick = jest.fn();
  //     render(
  //       <NeonButton onClick={mockClick} disabled>
  //         Disabled
  //       </NeonButton>
  //     );
  //     const button = screen.getByRole("button", { name: /disabled/i });
  //     expect(button).toBeDisabled();
  //     fireEvent.click(button);
  //     expect(mockClick).not.toHaveBeenCalled();
  //   });

  it("renders decorative elements", () => {
    render(<NeonButton>Decor</NeonButton>);
    expect(screen.getByText(/decor/i)).toBeInTheDocument();
    expect(document.querySelector("#container-stars")).toBeInTheDocument();
    expect(document.querySelector("#glow")).toBeInTheDocument();
    expect(document.querySelectorAll(".circle")).toHaveLength(2);
  });
});

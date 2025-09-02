/** 
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import ProfilePicture from "./profilePicture";
import "@testing-library/jest-dom";

// describe block groups together related tests for the ProfilePicture component
describe("ProfilePicture", () => {
  // test that the component renders an image with the correct src attribute
  it("renders an image with the given src", () => {
    // render the component with test props
    render(<ProfilePicture src="/test-image.jpg" alt="Test Profile" />);
    // find the image by its role and accessible name
    const img = screen.getByRole("img", { name: /test profile/i });

    // check that the image is actually in the document
    expect(img).toBeInTheDocument();
    // verify the src attribute matches what we passed in
    expect(img).toHaveAttribute("src", "/test-image.jpg");
  });

  // test that additional image props get passed through correctly
  it("passes through additional img props", () => {
    render(
      <ProfilePicture
        src="/avatar.png"
        alt="Custom Alt"
        data-testid="pfp-img"
      />
    );
    // find the image using the test id we provided
    const img = screen.getByTestId("pfp-img");

    // check that the alt text was passed through correctly
    expect(img).toHaveAttribute("alt", "Custom Alt");
    // double-check the src is still correct
    expect(img).toHaveAttribute("src", "/avatar.png");
  });

  // test that the wrapper div has the correct CSS classes
  it("applies correct wrapper classes", () => {
    render(<ProfilePicture src="/avatar.png" alt="Avatar" />);
    // find the image, then get its closest parent div (the wrapper)
    const wrapper = screen.getByRole("img", { name: /avatar/i }).closest("div");

    // check that the wrapper has the expected positioning class
    expect(wrapper).toHaveClass("relative");
    // verify it has the rounded-full class for circular shape
    expect(wrapper).toHaveClass("rounded-full");
  });

  // test that the decorative border rings are rendered
  it("renders decorative border rings", () => {
    render(<ProfilePicture src="/avatar.png" alt="Avatar" />);
    // find all elements that match the border ring CSS classes
    const borders = document.querySelectorAll(
      ".absolute.inset-0.rounded-full.border-4"
    );

    // should find exactly 2 border ring elements (probably inner and outer borders)
    expect(borders.length).toBe(2);
  });
});
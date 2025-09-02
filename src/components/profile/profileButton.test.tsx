/**
 * @jest-environment jsdom
 */

//import testing utilities from React Testing Library
import { render, screen } from "@testing-library/react";
//import the component we're testing
import ProfileButton from "./profileButton";
//extend Jest's expect with DOM-specific matchers
import "@testing-library/jest-dom";

//mock next/link so we can test without Next.js router
//this creates a simple mock version of the Next.js Link component
//that just renders a regular <a> tag with the provided href
jest.mock("next/link", () => {
  //the mock function receives props and returns a simple anchor tag
  return ({ href, children }: any) => <a href={href}>{children}</a>;
});

//test suite for the ProfileButton component
describe("ProfileButton", () => {
  //test that the button renders with the correct text
  it("renders the Edit Profile button", () => {
    //render the component
    render(<ProfileButton />);
    //check that a button with "edit profile" text exists in the document
    expect(
      screen.getByRole("button", { name: /edit profile/i })
    ).toBeInTheDocument();
  });

  //test that the button has the correct CSS classes applied
  it("renders with correct styling classes", () => {
    //render the component
    render(<ProfileButton />);
    //get the button element by its role and accessible name
    const button = screen.getByRole("button", { name: /edit profile/i });

    //check that the button has the expected CSS classes
    expect(button).toHaveClass("rounded-md"); // Rounded corners
    expect(button).toHaveClass("bg-[#00ffc3]"); // Teal background color
    expect(button).toHaveClass("hover:bg-[#00e6b3]"); // Hover state color
  });

  //testt that the button links to the correct URL
  it("links to /profile/edit", () => {
    //render the component
    render(<ProfileButton />);
    //get the link element (which is wrapped around the button)
    const link = screen.getByRole("link", { name: /edit profile/i });
    //verify that the href attribute points to the correct URL
    expect(link).toHaveAttribute("href", "/profile/edit");
  });

  //test that the button contains an edit icon (SVG)
  it("displays the edit icon", () => {
    //render the component
    render(<ProfileButton />);
    //get the button element
    const button = screen.getByRole("button", { name: /edit profile/i });

    //find the <svg> element inside the button and verify it exists
    //this checks that the icon is being rendered within the button
    expect(button.querySelector("svg")).toBeInTheDocument();
  });
});
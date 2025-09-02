/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import UserMenu from "./UserMenu";

//create a mock function to simulate Next.js router's replace method
const mockReplace = jest.fn();
//mock the next/navigation module to avoid actual routing during tests
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace, //provide our mock replace function
  }),
}));

//mock the firebase configuration to avoid actual authentication calls
jest.mock("@/config/firebaseConfig", () => {
  return {
    auth: {
      signOut: jest.fn(), //mock the signOut function
    },
  };
});

//test suite for the UserMenu component
describe("UserMenu", () => {
  //create a mock function for the onClose callback
  const mockOnClose = jest.fn();

  //beforeEach runs before each test in this describe block
  beforeEach(() => {
    //clear all mock calls to ensure clean state between tests
    jest.clearAllMocks();
  });

  //test that the menu renders both the profile link and sign out button
  it("renders Profile link and Sign Out button", () => {
    //render the component with our mock onClose function
    render(<UserMenu onClose={mockOnClose} />);
    //check that "Profile" text appears in the document
    expect(screen.getByText("Profile")).toBeInTheDocument();
    //check that "Sign Out" text appears in the document
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });

  //test that clicking the profile link calls the onClose callback
  it("calls onClose when Profile link is clicked", () => {
    render(<UserMenu onClose={mockOnClose} />);
    //simulate a click on the profile link
    fireEvent.click(screen.getByText("Profile"));
    //verify the onClose mock function was called exactly once
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  //test the complete sign out flow
  it("calls signOut, router.replace and onClose when Sign Out button is clicked", () => {
    //get the mocked auth object from our firebase config mock
    const { auth } = require("@/config/firebaseConfig");
    render(<UserMenu onClose={mockOnClose} />);
    //simulate clicking the sign out button
    fireEvent.click(screen.getByText("Sign Out"));

    //verify that firebase signOut was called
    expect(auth.signOut).toHaveBeenCalledTimes(1);
    //check that the router was redirected to the home page
    expect(mockReplace).toHaveBeenCalledWith("/");
    //verify that the menu was closed after signing out
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
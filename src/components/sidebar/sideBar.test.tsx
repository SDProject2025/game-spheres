/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "./sidebar";
import { useUser } from "@/config/userProvider";
import { useSidebar } from "@/config/sidebarProvider";
import React from "react";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
  usePathname: () => "/home",
}));

jest.mock("@/config/userProvider", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/config/sidebarProvider", () => ({
  useSidebar: jest.fn(),
}));

jest.mock("../UserMenu", () => (props: { onClose: () => void }) => (
  <div data-testid="user-menu">
    <button onClick={props.onClose}>Close Menu</button>
  </div>
));

jest.mock("../chat/messageCounter", () => (props: any) => (
  <div data-testid="chat-icon">Chat Icon</div>
));
jest.mock("../notifications/notificationCounter", () => (props: any) => (
  <div data-testid="inbox-icon">Inbox Icon</div>
));

describe("Sidebar Component", () => {
  const mockUser = {
    displayName: "John Doe",
    email: "john@example.com",
    photoURL: "/avatar.jpg",
  };

  beforeEach(() => {
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (useSidebar as jest.Mock).mockReturnValue({
      isExpanded: true,
      toggleSidebar: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders navigation items correctly", () => {
    render(<Sidebar />);
    expect(screen.getByTestId("home")).toBeInTheDocument();
    expect(screen.getByTestId("gamespheres")).toBeInTheDocument();
    expect(screen.getByTestId("uploadclip")).toBeInTheDocument();
    expect(screen.getByTestId("searchusers")).toBeInTheDocument();
    expect(screen.getByTestId("chat")).toBeInTheDocument();
    expect(screen.getByTestId("inbox")).toBeInTheDocument();
    expect(screen.getByTestId("settings")).toBeInTheDocument();
  });


  it("shows ChevronLeft when expanded", () => {
    render(<Sidebar />);
    const button = screen.getByRole("button");
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument(); 
  });

  it("calls toggleSidebar when chevron button is clicked", () => {
    const mockToggle = jest.fn();
    (useSidebar as jest.Mock).mockReturnValue({
      isExpanded: true,
      toggleSidebar: mockToggle,
    });
    render(<Sidebar />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockToggle).toHaveBeenCalled();
  });

  it("highlights the active navigation item based on pathname", () => {
    render(<Sidebar />);
    const homeLink = screen.getByTestId("home");
    expect(homeLink).toHaveClass("bg-[#3d3c3c]");
  });

  describe("Profile Section - Expanded View", () => {
    it("renders user profile details", () => {
      render(<Sidebar />);
      expect(screen.getByAltText("Avatar")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    it("toggles UserMenu when 'more' icon is clicked", () => {
      render(<Sidebar />);
      const moreToggle = screen.getByTestId("more-toggle");

      fireEvent.click(moreToggle);
      expect(screen.getByTestId("user-menu")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Close Menu"));
      expect(screen.queryByTestId("user-menu")).not.toBeInTheDocument();
    });
  });

  describe("Collapsed Sidebar", () => {
    beforeEach(() => {
      (useSidebar as jest.Mock).mockReturnValue({
        isExpanded: false,
        toggleSidebar: jest.fn(),
      });
    });

    it("renders only icons when collapsed", () => {
      render(<Sidebar />);
      expect(screen.getByTestId("home")).toBeInTheDocument();

      const homeText = screen.queryByText("Home");
      expect(homeText).toBeNull();
    });

    it("shows UserMenu when collapsed avatar is clicked", () => {
      render(<Sidebar />);
      const avatar = screen.getByAltText("Avatar");

      fireEvent.click(avatar);
      expect(screen.getByTestId("user-menu")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Close Menu"));
      expect(screen.queryByTestId("user-menu")).not.toBeInTheDocument();
    });
  });
  
  it("navigates to /profile when avatar or profile info is clicked", () => {
  const mockReplace = jest.fn();
  (useSidebar as jest.Mock).mockReturnValue({
    isExpanded: true,
    toggleSidebar: jest.fn(),
  });
  // Mock the router
  jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue({
    replace: mockReplace,
  });

  render(<Sidebar />);

  const avatar = screen.getByAltText("Avatar");
  const profileInfo = screen.getByText("John Doe"); // Profile name area

  // Click the avatar
  fireEvent.click(avatar);
  expect(mockReplace).toHaveBeenCalledWith("/profile");

  // Reset mock calls
  mockReplace.mockClear();

  // Click the profile info text
  fireEvent.click(profileInfo);
  expect(mockReplace).toHaveBeenCalledWith("/profile");
});
});
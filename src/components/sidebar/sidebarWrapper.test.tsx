/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import SidebarWrapper from "./sidebarWrapper";

// Mock the Sidebar component
jest.mock("./sidebar", () => () => <div data-testid="sidebar">Sidebar Content</div>);

// Mock useUser and useSidebar hooks
jest.mock("@/config/userProvider", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/config/sidebarProvider", () => ({
  useSidebar: jest.fn(),
}));

import { useUser } from "@/config/userProvider";
import { useSidebar } from "@/config/sidebarProvider";

// Utility to change window size
const resizeWindow = (width: number) => {
  act(() => {
    (window as any).innerWidth = width;
    window.dispatchEvent(new Event("resize"));
  });
};

describe("SidebarWrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock values
    (useUser as jest.Mock).mockReturnValue({ user: { emailVerified: true } });
    (useSidebar as jest.Mock).mockReturnValue({ isExpanded: true });
  });

  it("renders nothing if no user is provided", () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });
    const { container } = render(<SidebarWrapper />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing if user email is not verified", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { emailVerified: false } });
    const { container } = render(<SidebarWrapper />);
    expect(container.firstChild).toBeNull();
  });

  describe("Desktop behavior (width >= 768px)", () => {
    beforeEach(() => {
      resizeWindow(1024); // simulate desktop screen
    });

    it("renders expanded sidebar when isExpanded is true", () => {
      (useSidebar as jest.Mock).mockReturnValue({ isExpanded: true });
      render(<SidebarWrapper />);
      const sidebar = screen.getByTestId("sidebar").parentElement;
      expect(sidebar).toHaveClass("w-64");
    });

    it("renders collapsed sidebar when isExpanded is false", () => {
      (useSidebar as jest.Mock).mockReturnValue({ isExpanded: false });
      render(<SidebarWrapper />);
      const sidebar = screen.getByTestId("sidebar").parentElement;
      expect(sidebar).toHaveClass("w-16");
    });
  });

  describe("Mobile behavior (width < 768px)", () => {
    beforeEach(() => {
      resizeWindow(500); // simulate mobile screen
    });

    it("shows mobile menu button", () => {
      render(<SidebarWrapper />);
      expect(screen.getByRole("button", { name: "☰" })).toBeInTheDocument();
    });

    it("opens mobile sidebar when menu button is clicked", () => {
      render(<SidebarWrapper />);
      const menuButton = screen.getByRole("button", { name: "☰" });

      fireEvent.click(menuButton);

      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "✕" })).toBeInTheDocument();
    });

    it("closes mobile sidebar when backdrop is clicked", () => {
      render(<SidebarWrapper />);
      fireEvent.click(screen.getByRole("button", { name: "☰" }));

      const backdrop = screen.getByTestId("mobile-backdrop");
      fireEvent.click(backdrop);


      expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
    });

    it("closes mobile sidebar when close button is clicked", () => {
      render(<SidebarWrapper />);
      fireEvent.click(screen.getByRole("button", { name: "☰" }));

      const closeButton = screen.getByRole("button", { name: "✕" });
      fireEvent.click(closeButton);

      expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
    });
  });
});

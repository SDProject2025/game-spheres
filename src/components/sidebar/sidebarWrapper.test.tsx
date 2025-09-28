/** 
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import SidebarWrapper from "./sidebarWrapper";

//mock Sidebar so we don’t render full comopnent
jest.mock("./sidebar", () => { 
  return function MockSidebar() { 
    return <div data-testid="sidebar">Mock Sidebar</div>; //mock sidebar renders a simple div
  };
});

//mock providers
jest.mock("@/config/userProvider", () => ({ 
  useUser: jest.fn(), //mock useUser hook
}));

jest.mock("@/config/sidebarProvider", () => ({ 
  useSidebar: jest.fn(), //mock useSidebar hook
}));

describe("SidebarWrapper", () => { 
  beforeEach(() => { 
    jest.resetAllMocks(); //reset mocks before each test
    document.documentElement.style.setProperty = jest.fn(); //mock setProperty to track sidebar width changes
  });

  it("renders Sidebar when user exists and is email verified", () => { 
    const { useUser } = require("@/config/userProvider"); //grab the mocked useUser
    const { useSidebar } = require("@/config/sidebarProvider"); //grab the mocked useSidebar

    useUser.mockReturnValue({ 
      user: { displayName: "Test User", emailVerified: true }, //simulate a verified user
      loading: false, //loading is false
    });

    useSidebar.mockReturnValue({ 
      isExpanded: true, //sidebar is expanded
    });

    render(<SidebarWrapper />); //render component

    const sidebar = screen.getByTestId("sidebar"); //query for mocked sidebar
    expect(sidebar).toBeInTheDocument(); //check that sidebar is in the document
  });

  it("returns null if user is not present", () => { 
    const { useUser } = require("@/config/userProvider"); 
    const { useSidebar } = require("@/config/sidebarProvider"); 

    useUser.mockReturnValue({ 
      user: null,
      loading: false, 
    });

    useSidebar.mockReturnValue({ 
      isExpanded: true, 
    });

    const { container } = render(<SidebarWrapper />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null if user is not email verified", () => { 
    const { useUser } = require("@/config/userProvider"); 
    const { useSidebar } = require("@/config/sidebarProvider"); 

    useUser.mockReturnValue({ 
      user: { displayName: "Test User", emailVerified: false }, //simulate unverified user
      loading: false, 
    });

    useSidebar.mockReturnValue({ 
      isExpanded: true, 
    });

    const { container } = render(<SidebarWrapper />); 
    expect(container.firstChild).toBeNull(); //expect nothing to render
  });

  it("applies collapsed width class when isExpanded is false", () => { 
    const { useUser } = require("@/config/userProvider"); 
    const { useSidebar } = require("@/config/sidebarProvider"); 

    useUser.mockReturnValue({ 
      user: { displayName: "Test User", emailVerified: true }, //verified user
      loading: false, 
    });

    useSidebar.mockReturnValue({ 
      isExpanded: false, //sidebar collapsed
    });

    render(<SidebarWrapper />); 
    const aside = screen.getByTestId("sidebar").closest("aside"); //get the parent aside
    expect(aside).toHaveClass("w-16"); //expect collapsed width class
  });

  it("applies expanded width class when isExpanded is true", () => { 
    const { useUser } = require("@/config/userProvider"); 
    const { useSidebar } = require("@/config/sidebarProvider"); 

    useUser.mockReturnValue({ 
      user: { displayName: "Test User", emailVerified: true }, //verified user
      loading: false, 
    });

    useSidebar.mockReturnValue({ 
      isExpanded: true, //sidebar expanded
    });

    render(<SidebarWrapper />); 
    const aside = screen.getByTestId("sidebar").closest("aside"); //get the parent aside
    expect(aside).toHaveClass("w-64"); //expect expanded width class
  });
});

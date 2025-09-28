/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { onIdTokenChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  onIdTokenChanged: jest.fn(),
}));

jest.mock("@/config/firebaseConfig", () => ({
  auth: {},
  db: {},
  googleProvider: {},
  storage: {},
}));

import UnauthorisedPage from "./page";

describe("UnauthorisedPage", () => {
  const mockPush = jest.fn();
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the page correctly", () => {

    (onIdTokenChanged as jest.Mock).mockReturnValue(mockUnsubscribe);

    render(<UnauthorisedPage />);
    expect(screen.getByText("Verify Your Email")).toBeInTheDocument();
  });

  it("redirects to /home if user email is verified", async () => {
    const mockUser = {
      emailVerified: true,
      reload: jest.fn().mockResolvedValue(undefined),
    };

    (onIdTokenChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(mockUser);
      return mockUnsubscribe;
    });

    render(<UnauthorisedPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/home");
    });
  });

  it("does not redirect if user email is NOT verified", async () => {
    const mockUser = {
      emailVerified: false,
      reload: jest.fn().mockResolvedValue(undefined),
    };

    (onIdTokenChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(mockUser);       
      return mockUnsubscribe;
    });

    render(<UnauthorisedPage />);

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it("unsubscribes from Firebase listener on unmount", () => {
    (onIdTokenChanged as jest.Mock).mockReturnValue(mockUnsubscribe);

    const { unmount } = render(<UnauthorisedPage />);
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});

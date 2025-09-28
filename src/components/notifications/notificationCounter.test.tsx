/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import NotificationCounter from "./notificationCounter";
import { useUser } from "@/config/userProvider";
import { collection, query, where, onSnapshot } from "firebase/firestore";
jest.mock("@/config/firebaseConfig", () => ({
  db: {}, // mock firestore instance
}));

jest.mock("@/config/userProvider", () => ({
  useUser: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
}));

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("InboxIcon", () => {
  const mockUser = { uid: "user-123" };

  test("does NOT subscribe when there is no user", () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });

    render(<NotificationCounter />);

    expect(collection).not.toHaveBeenCalled();
    expect(onSnapshot).not.toHaveBeenCalled();
    expect(screen.getByTestId("mail-icon")).toBeInTheDocument();


    expect(screen.queryByText("0")).toBeNull();
  });

  test("subscribes to Firestore when there is a user", () => {
    const mockUnsub = jest.fn();

    (useUser as jest.Mock).mockReturnValue({ user: mockUser });

    (onSnapshot as jest.Mock).mockImplementation((_q, callback) => {
      const mockSnapshot = { size: 5 };
      callback(mockSnapshot);
      return mockUnsub;
    });

    render(<NotificationCounter />);
    expect(collection).toHaveBeenCalledWith(expect.anything(), "users", mockUser.uid, "notifications");
    expect(where).toHaveBeenCalledWith("read", "==", false);
    expect(query).toHaveBeenCalled();

    // onSnapshot should be subscribed
    expect(onSnapshot).toHaveBeenCalled();

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  test("unsubscribes from Firestore on unmount", () => {
    const mockUnsub = jest.fn();

    (useUser as jest.Mock).mockReturnValue({ user: mockUser });

    (onSnapshot as jest.Mock).mockImplementation(() => mockUnsub);

    const { unmount } = render(<NotificationCounter />);
    unmount();

    expect(mockUnsub).toHaveBeenCalled();
  });

  test("badge should not render when unread count is zero", () => {
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });

    (onSnapshot as jest.Mock).mockImplementation((_q, callback) => {
      const mockSnapshot = { size: 0 }; // no unread notifications
      callback(mockSnapshot);
      return jest.fn();
    });

    render(<NotificationCounter />);

    expect(screen.queryByText("0")).toBeNull();
  });
});

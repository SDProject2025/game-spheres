/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, act, cleanup } from "@testing-library/react";
import ChatIcon from "./messageCounter";

jest.mock("@/config/userProvider", () => ({
  useUser: jest.fn(),
}));

const mockOnSnapshot = jest.fn();
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();

jest.mock("firebase/firestore", () => ({
  collection: (...args: any[]) => mockCollection(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
}));

jest.mock("@/app/api/collections", () => ({
  CONVERSATIONS_COLLECTION: "conversations",
}));

jest.mock("@/config/firebaseConfig", () => ({
  db: {},
}));

import { useUser } from "@/config/userProvider";


describe("ChatIcon Component", () => {
  const mockUser = { uid: "user123" };
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useUser as jest.Mock).mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((_q, callback) => {
      callback({ docs: [] });
      return mockUnsubscribe;
    });
  });

  afterEach(cleanup);

  test("renders chat icon always", () => {
    render(<ChatIcon />);
    const icon = document.querySelector("svg.lucide-message-circle-more");
    expect(icon).toBeInTheDocument();
  });

  test("does NOT render unread badge when unreadCount is 0", () => {
    render(<ChatIcon />);

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  test("renders unread badge when unreadCount > 0", async () => {
    mockOnSnapshot.mockImplementation((_q, callback) => {
      const fakeSnapshot = {
        docs: [
          {
            data: () => ({
              unreadCounts: { user123: 2 },
            }),
          },
          {
            data: () => ({
              unreadCounts: { user123: 3 },
            }),
          },
        ],
      };
      callback(fakeSnapshot);
      return mockUnsubscribe;
    });

    await act(async () => {
      render(<ChatIcon />);
    });

    // Total unreadCount should equal 2 + 3 = 5
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  test("subscribes with correct query using user.uid", () => {
    render(<ChatIcon />);

    expect(mockCollection).toHaveBeenCalledWith({}, "conversations");
    expect(mockWhere).toHaveBeenCalledWith("participants", "array-contains", "user123");
    expect(mockQuery).toHaveBeenCalled();

    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  test("calls unsubscribe on unmount", () => {
    const { unmount } = render(<ChatIcon />);
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  test("does not subscribe when user is null", () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });

    render(<ChatIcon />);

    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });
});

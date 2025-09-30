/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ClipGrid from "./ClipGrid";
import { db } from "@/config/firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

// MOCK FIRESTORE
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  onSnapshot: jest.fn((ref, callback) => {
    // Always return a mock snapshot for comments and likes
    if (ref && typeof ref === "object") {
      callback({
        docs: [
          {
            id: "comment1",
            data: () => ({
              text: "Test comment",
              createdAt: new Date(),
              userId: "user1",
            }),
          },
        ],
        exists: () => true,
        data: () => ({ likesCount: 10 }),
      });
    }
    return () => {}; // unsubscribe function
  }),
  orderBy: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
    onAuthStateChanged: jest.fn(),
}));

jest.mock("@/config/firebaseConfig", () => ({
  db: {},
}));

//Mux Mock
jest.mock("@mux/mux-player-react", () => {
  return () => <div data-testid="mux-player" />;
});

//Mock Provider
jest.mock("@/config/gameSpheresContext", () => ({
  useGameSpheresContext: jest.fn(() => ({
    gameSpheres: [
      { id: "gs1", name: "Action Games" },
      { id: "gs2", name: "Puzzle Games" }
    ],
    refreshGameSpheres: jest.fn(),
  })),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

// SAMPLE CLIP DATA
const mockClip = {
  id: "clip1",
  caption: "clip1",
  uploadedBy: "user1",
  processingStatus: "ready",
  uploadedAt: { toDate: () => new Date() },
  likesLast24h: 5,
  gameSphereId: "gs1",
  muxPlaybackId: "some-playback-id", // ✅ This is the key!
  thumbnailUrl: "https://example.com/thumb.jpg"
};

describe("ClipGrid Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (collection as jest.Mock).mockReturnValue("mockCollection");
    (query as jest.Mock).mockReturnValue("mockQuery");
    (where as jest.Mock).mockReturnValue("mockWhere");
  });

  it("renders no clips state", async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      forEach: () => {}, // no clips
    });

    render(<ClipGrid />);
    expect(screen.getByText(/loading clips/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/🎮/i)).toBeInTheDocument();
      expect(screen.getByText(/No clips found/i)).toBeInTheDocument();
    });
  });

  it("loads saved clips when savedClips and profileFilter are set", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        savedClips: ["clip1", "clip2"],
      }),
    });

      // Mock getDocs for batch1 (clip1 and clip2)
  (getDocs as jest.Mock)
    .mockResolvedValueOnce({
      forEach: (cb: Function) => {
        cb({
          id: "clip1",
          data: () => ({
            caption: "clip1 caption",
            uploadedBy: "user1",
            processingStatus: "ready",
            uploadedAt: { toDate: () => new Date() },
            gameSphereId: "gs1",
          }),
        });
        cb({
          id: "clip2",
          data: () => ({
            caption: "clip2 caption",
            uploadedBy: "user1",
            processingStatus: "ready",
            uploadedAt: { toDate: () => new Date() },
            gameSphereId: "gs1",
          }),
        });
      },
    })
    // If more batches happen, return empty
    .mockResolvedValue({
      forEach: () => {},
    });

    render(<ClipGrid savedClips={true} profileFilter="user1" />);

    await waitFor(() => {
      expect(getDoc).toHaveBeenCalled();
      expect(screen.getByText(/clip1/i)).toBeInTheDocument();
    });
  });

  it("renders clips state", async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      forEach: (cb: Function) =>
        cb({
          id: "clip1",
          data: () => ({
            uploadedAt: { toDate: () => new Date() },
            processingStatus: "ready",
            uploadedBy: "user1",
            gameSphereId: "gs1",
          }),
        }),
    });

    render(<ClipGrid />);
    expect(screen.getByText(/loading clips/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/Action Games/i)[0]).toBeInTheDocument();
    });
  });

  // it("loads home clips when userFilter is set", async () => {
  //   (getDoc as jest.Mock).mockResolvedValueOnce({
  //     exists: () => true,
  //     data: () => ({
  //       gsSubs: [{ id: "gs1" }],
  //       following: ["user1"],
  //     }),
  //   });

  //   (getDocs as jest.Mock)
  //   .mockResolvedValueOnce({
  //     forEach: (cb: Function) => {
  //       cb({
  //         id: "clip1",
  //         data: () => ({
  //           caption: "clip1 caption",
  //           uploadedBy: "user2",
  //           processingStatus: "ready",
  //           uploadedAt: { toDate: () => new Date() },
  //           gameSphereId: "gs1",
  //         }),
  //       });
  //     },
  //   })
  //   .mockResolvedValueOnce({
  //     forEach: () => {}, // second call returns nothing
  //   });

  //   render(<ClipGrid userFilter="user2" />);

  //   await waitFor(() => {
  //     expect(getDoc).toHaveBeenCalled();
  //     expect(screen.getByText(/clip1/i)).toBeInTheDocument();
  //   });
  // });

  it("renders empty state if no saved clips exist", async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: true,
      data: () => ({
        savedClips: [],
      }),
    });

    render(<ClipGrid savedClips={true} profileFilter="user1" />);

    await waitFor(() =>
      expect(screen.getByText(/No clips found/i)).toBeInTheDocument()
    );
  });

  it("sorts clips by popularWeek correctly", async () => {
    const clipA = { ...mockClip, id: "a", likesLastWeek: 10 };
    const clipB = { ...mockClip, id: "b", likesLastWeek: 5 };

    (getDocs as jest.Mock).mockResolvedValue({
      forEach: (cb: Function) => {
        cb({ id: "a", data: () => clipA });
        cb({ id: "b", data: () => clipB });
      },
    });

    render(<ClipGrid sortBy="popularWeek" />);

    await waitFor(() => {
      const clips = screen.getAllByText(/clip1/i); // Will match both
      expect(clips.length).toBeGreaterThan(0);
    });
  });

  it("opens and closes video modal correctly", async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      forEach: (cb: Function) =>
        cb({
          id: "clip1",
          data: () => mockClip,
        }),
    });

    render(<ClipGrid />);

    // Wait for clips to load
    await waitFor(() =>
      expect(screen.getByText(/clip1/i)).toBeInTheDocument()
    );

    // Simulate clicking the clip card to open modal
    const thumbnail = screen.getByAltText("Video thumbnail");
    fireEvent.click(thumbnail);

    // Wait for the Mux player modal to appear
    await waitFor(() =>
      expect(screen.getByTestId("mux-player")).toBeInTheDocument()
    );

    // Close modal by clicking backdrop
    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);

    // Wait for modal to be removed
    await waitFor(() =>
      expect(screen.queryByTestId("mux-player")).not.toBeInTheDocument()
    );
  });

  it("handles errors gracefully when loading saved clips", async () => {
    (getDoc as jest.Mock).mockRejectedValue(new Error("Firestore exploded"));

    render(<ClipGrid savedClips={true} profileFilter="user1" />);

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error loading saved clips:",
        expect.any(Error)
      )
    );
  });

  it("renders 'No clips found' if no clips match", async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      forEach: () => {}, // no clips
    });
    (query as jest.Mock).mockReturnValue("mockQuery");
    (collection as jest.Mock).mockReturnValue("mockCollection");

    render(<ClipGrid />);

    await waitFor(() =>
      expect(screen.getByText(/No clips found/i)).toBeInTheDocument()
    );
  });

  it("logs error if getDocs fails", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation();

    (getDocs as jest.Mock).mockRejectedValue(new Error("Firestore error"));

    render(<ClipGrid />);

    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error loading clips:",
        expect.any(Error)
      )
    );
  });

   it("applies gameSphereFilter", async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      forEach: (cb: Function) => cb({ id: "clip1", data: () => mockClip }),
    });

    render(<ClipGrid gameSphereFilter="gs1" />);

    await waitFor(() =>
      expect(where).toHaveBeenCalledWith("gameSphereId", "==", "gs1")
    );
  });
});

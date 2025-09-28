/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { useComments } from "./useComments";
import {
  addComment,
  deleteComment,
  listenToComments,
} from "@/services/clipsService";
import type { Comment } from "@/types/Comment";

jest.mock("@/services/clipsService", () => ({
  listenToComments: jest.fn(),
  addComment: jest.fn(),
  deleteComment: jest.fn(),
}));

describe("useComments", () => {
  const clipId = "clip-123";
  const uploaderId = "uploader-999";

  const mockUser = {
    uid: "user-123",
    username: "testuser",
    displayName: "Test User",
    photoURL: "http://example.com/avatar.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with an empty comments array", () => {
    (listenToComments as jest.Mock).mockReturnValue(() => {});
    const { result } = renderHook(() => useComments(clipId, mockUser));

    expect(result.current.comments).toEqual([]);
  });

    it("subscribes to comments and updates state when new comments come in", () => {
    let callbackFn: (data: Comment[]) => void = () => {};
    const unsubscribe = jest.fn();

    (listenToComments as jest.Mock).mockImplementation((_clipId, callback) => {
        callbackFn = callback;
        return unsubscribe;
    });

    const { result, unmount } = renderHook(() => useComments(clipId, mockUser));

    const mockComments: Comment[] = [
        {
        id: "c1",
        userId: "user-123",
        text: "First comment",
        createdAt: new Date(),
        displayName: "John Doe",
        photoURL: "http://example.com/avatar1.jpg",
        },
    ];

    act(() => {
        callbackFn(mockComments);
    });

    expect(result.current.comments).toEqual(mockComments);

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
    });


  it("adds a comment using addComment when user is logged in", async () => {
    (listenToComments as jest.Mock).mockReturnValue(() => {});

    const { result, unmount } = renderHook(() => useComments(clipId, mockUser));


    await act(async () => {
      await result.current.add("New comment text");
    });

    expect(addComment).toHaveBeenCalledWith(
      clipId,
      {
        uid: mockUser.uid,
        username: mockUser.username,
        displayName: mockUser.displayName,
        photoURL: mockUser.photoURL,
      },
      "New comment text"
    );
  });

  it("does not call addComment if there is no user", async () => {
    (listenToComments as jest.Mock).mockReturnValue(() => {});
    const { result } = renderHook(() => useComments(clipId, null));

    await act(async () => {
      await result.current.add("Attempted comment");
    });

    expect(addComment).not.toHaveBeenCalled();
  });

  it("deletes a comment if user is the comment owner", async () => {
    (listenToComments as jest.Mock).mockReturnValue(() => {});
    const { result } = renderHook(() => useComments(clipId, mockUser));

    await act(async () => {
      await result.current.remove("c1", mockUser.uid!);
    });

    expect(deleteComment).toHaveBeenCalledWith(clipId, "c1");
  });

  it("deletes a comment if user is the uploader", async () => {
    const uploader = { ...mockUser, uid: uploaderId };
    (listenToComments as jest.Mock).mockReturnValue(() => {});
    const { result } = renderHook(() => useComments(clipId, uploader, uploaderId));

    await act(async () => {
      await result.current.remove("c1", "someone-else");
    });

    expect(deleteComment).toHaveBeenCalledWith(clipId, "c1");
  });

  it("does not delete a comment if user is neither owner nor uploader", async () => {
    (listenToComments as jest.Mock).mockReturnValue(() => {});
    const randomUser = { ...mockUser, uid: "random-user" };

    const { result } = renderHook(() => useComments(clipId, randomUser, uploaderId));

    await act(async () => {
      await result.current.remove("c1", "other-user");
    });

    expect(deleteComment).not.toHaveBeenCalled();
  });

  it("does not delete a comment if there is no user", async () => {
    (listenToComments as jest.Mock).mockReturnValue(() => {});
    const { result } = renderHook(() => useComments(clipId, null));

    await act(async () => {
      await result.current.remove("c1", "user-123");
    });

    expect(deleteComment).not.toHaveBeenCalled();
  });
});

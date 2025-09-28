/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { useClipLikes } from "./useClipLikes";
import { listenToLikes, toggleLikeClip } from "@/services/clipsService";

jest.mock("@/services/clipsService", () => ({
  listenToLikes: jest.fn(),
  toggleLikeClip: jest.fn(),
}));

describe("useClipLikes", () => {
  const clipId = "clip-123";
  const userId = "user-456";

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset global fetch mock
    global.fetch = jest.fn();
  });

  it("should initialize with default values", () => {
    (listenToLikes as jest.Mock).mockReturnValue(() => {}); // dummy unsubscribe

    const { result } = renderHook(() => useClipLikes(clipId, userId));

    expect(result.current.likesCount).toBe(0);
    expect(result.current.isLiked).toBe(false);
    expect(result.current.isLiking).toBe(false);
    expect(typeof result.current.toggleLike).toBe("function");
  });

  it("should call listenToLikes on mount and unsubscribe on unmount", () => {
    const unsubscribe = jest.fn();
    (listenToLikes as jest.Mock).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useClipLikes(clipId, userId));

    expect(listenToLikes).toHaveBeenCalledWith(clipId, expect.any(Function));

    // Cleanup
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("should update likesCount when listenToLikes callback is called", () => {
    let callbackFn: (count: number) => void = () => {};
    (listenToLikes as jest.Mock).mockImplementation((_clipId, callback) => {
      callbackFn = callback;
      return jest.fn(); // mock unsubscribe
    });

    const { result } = renderHook(() => useClipLikes(clipId, userId));

    act(() => {
      callbackFn(42); // simulate a new like count from subscription
    });

    expect(result.current.likesCount).toBe(42);
  });

  it("should fetch initial isLiked state and update correctly", async () => {
    (listenToLikes as jest.Mock).mockReturnValue(() => {});
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ isLiked: true }),
    });

    const { result } = renderHook(() => useClipLikes(clipId, userId));

    // Wait for useEffect async fetch to resolve
    await act(async () => {});

    expect(global.fetch).toHaveBeenCalledWith(
      `/api/clips/likes?userId=${userId}&clipId=${clipId}`
    );
    expect(result.current.isLiked).toBe(true);
  });

  it("should call toggleLikeClip with 'like' and update state", async () => {
    (listenToLikes as jest.Mock).mockReturnValue(() => {});
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ isLiked: false }),
    });

    const { result } = renderHook(() => useClipLikes(clipId, userId));

    await act(async () => {}); // wait for initial fetch

    await act(async () => {
      await result.current.toggleLike();
    });

    expect(toggleLikeClip).toHaveBeenCalledWith(userId, clipId, "like");
    expect(result.current.isLiked).toBe(true);
    expect(result.current.isLiking).toBe(false);
  });

  it("should call toggleLikeClip with 'unlike' when already liked", async () => {
    (listenToLikes as jest.Mock).mockReturnValue(() => {});
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ isLiked: true }),
    });

    const { result } = renderHook(() => useClipLikes(clipId, userId));

    await act(async () => {}); // wait for initial fetch

    await act(async () => {
      await result.current.toggleLike();
    });

    expect(toggleLikeClip).toHaveBeenCalledWith(userId, clipId, "unlike");
    expect(result.current.isLiked).toBe(false);
  });

  it("should not call toggleLikeClip if userId is missing", async () => {
    (listenToLikes as jest.Mock).mockReturnValue(() => {});
    const { result } = renderHook(() => useClipLikes(clipId, undefined));

    await act(async () => {
      await result.current.toggleLike();
    });

    expect(toggleLikeClip).not.toHaveBeenCalled();
  });

  it("should prevent multiple toggleLike calls while isLiking is true", async () => {
    (listenToLikes as jest.Mock).mockReturnValue(() => {});
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ isLiked: false }),
    });

    const { result } = renderHook(() => useClipLikes(clipId, userId));

    await act(async () => {}); // wait for initial fetch

    // Simulate first toggle
    act(() => {
      result.current.toggleLike();
    });

    // Immediately try toggling again
    await act(async () => {
      await result.current.toggleLike();
    });

    // toggleLikeClip should only be called once
    expect(toggleLikeClip).toHaveBeenCalledTimes(1);
  });
});

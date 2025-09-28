/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { useSaveStatus } from "./useSaveStatus";
import { checkSavedStatus, toggleSaveClip } from "@/services/clipsService";

jest.mock("@/services/clipsService", () => ({
  checkSavedStatus: jest.fn(),
  toggleSaveClip: jest.fn(),
}));

describe("useSaveStatus", () => {
  const clipId = "clip-123";
  const mockUser = { uid: "user-123" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with provided initialSaved value", () => {
    const { result } = renderHook(() => useSaveStatus(clipId, mockUser, true));
    expect(result.current.saved).toBe(true);
  });

  it("defaults to undefined if no initialSaved is provided", () => {
    const { result } = renderHook(() => useSaveStatus(clipId, mockUser));
    expect(result.current.saved).toBeUndefined();
  });

  it("calls checkSavedStatus on mount and updates state", async () => {
    (checkSavedStatus as jest.Mock).mockResolvedValue({ isSaved: true });

    const { result } = renderHook(() => useSaveStatus(clipId, mockUser));

    // Wait for useEffect to resolve
    await act(async () => {});

    expect(checkSavedStatus).toHaveBeenCalledWith(mockUser.uid, clipId);
    expect(result.current.saved).toBe(true);
  });

  it("does not call checkSavedStatus if user is null", async () => {
    const { result } = renderHook(() => useSaveStatus(clipId, null));

    await act(async () => {});

    expect(checkSavedStatus).not.toHaveBeenCalled();
    expect(result.current.saved).toBeUndefined();
  });

  it("updates saved to true when toggleSave is called with 'save'", async () => {
    (toggleSaveClip as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useSaveStatus(clipId, mockUser));

    await act(async () => {
      await result.current.toggleSave("save");
    });

    expect(toggleSaveClip).toHaveBeenCalledWith(mockUser.uid, clipId, "save");
    expect(result.current.saved).toBe(true);
  });

  it("updates saved to false when toggleSave is called with 'unsave'", async () => {
    (toggleSaveClip as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useSaveStatus(clipId, mockUser, true));

    await act(async () => {
      await result.current.toggleSave("unsave");
    });

    expect(toggleSaveClip).toHaveBeenCalledWith(mockUser.uid, clipId, "unsave");
    expect(result.current.saved).toBe(false);
  });

  it("does not call toggleSaveClip if user is null", async () => {
    const { result } = renderHook(() => useSaveStatus(clipId, null));

    await act(async () => {
      await result.current.toggleSave("save");
    });

    expect(toggleSaveClip).not.toHaveBeenCalled();
  });

  it("logs an error if checkSavedStatus throws", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    (checkSavedStatus as jest.Mock).mockRejectedValue(new Error("Network error"));

    renderHook(() => useSaveStatus(clipId, mockUser));

    await act(async () => {});

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error checking saved status:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it("logs an error if toggleSaveClip throws", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    (toggleSaveClip as jest.Mock).mockRejectedValue(new Error("Toggle failed"));

    const { result } = renderHook(() => useSaveStatus(clipId, mockUser));

    await act(async () => {
      await result.current.toggleSave("save");
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error toggling save:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});

/**
 * @jest-environment jsdom
 */

(global as any).fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);
jest.mock("@/config/firebaseConfig", () => ({
  db: {},
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

import {
  fetchUploader,
  checkSavedStatus,
  toggleSaveClip,
  toggleLikeClip,
  listenToLikes,
  listenToComments,
  addComment,
  deleteComment,
} from "./clipsService";

import { authFetch } from "@/config/authorisation";
import {
  doc,
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

jest.mock("@/config/authorisation", () => ({
  authFetch: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
getFirestore: jest.fn(),
  doc: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
  serverTimestamp: jest.fn(),
  getDoc: jest.fn(),
}));


describe("clipsService", () => {
  const clipId = "clip-1";
  const userId = "user-123";

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  // ---------------- fetchUploader ----------------
  describe("fetchUploader", () => {
    it("fetches uploader successfully", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ name: "Uploader" }),
      });

      const result = await fetchUploader("uploader-1");
      expect(global.fetch).toHaveBeenCalledWith("/api/profile?uid=uploader-1");
      expect(result).toEqual({ name: "Uploader" });
    });

    it("throws error when fetch fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

      await expect(fetchUploader("bad-id")).rejects.toThrow(
        "Failed to fetch user profile"
      );
    });
  });

  // ---------------- checkSavedStatus ----------------
  describe("checkSavedStatus", () => {
    it("calls API and returns saved status", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ isSaved: true }),
      });

      const result = await checkSavedStatus(userId, clipId);
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/clips/savedClips?userId=${userId}&clipId=${clipId}`
      );
      expect(result).toEqual({ isSaved: true });
    });

    it("throws error if API response is not ok", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

      await expect(checkSavedStatus(userId, clipId)).rejects.toThrow(
        "Failed to check saved status"
      );
    });
  });

  describe("toggleSaveClip", () => {
    it("posts save/unsave action", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await toggleSaveClip(userId, clipId, "save");
      expect(global.fetch).toHaveBeenCalledWith("/api/clips/savedClips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, clipId, action: "save" }),
      });
    });
  });

  describe("toggleLikeClip", () => {
    it("posts like when clip does not exist", async () => {
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await toggleLikeClip(userId, clipId, "like");

      expect(global.fetch).toHaveBeenCalledWith("/api/clips/likes", expect.any(Object));
    });

    it("posts like and creates notification when clip exists", async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ uploadedBy: "uploader-1" }),
      });

      (authFetch as jest.Mock).mockResolvedValue({ ok: true });
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await toggleLikeClip(userId, clipId, "like");

      expect(authFetch).toHaveBeenCalledWith("/api/notifications/create", expect.any(Object));
      expect(global.fetch).toHaveBeenCalledWith("/api/clips/likes", expect.any(Object));
    });

    it("handles unlike without creating notification", async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ uploadedBy: "uploader-1" }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await toggleLikeClip(userId, clipId, "unlike");

      expect(authFetch).not.toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith("/api/clips/likes", expect.any(Object));
    });

    it("catches and logs error", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      (getDoc as jest.Mock).mockRejectedValue(new Error("Firestore error"));

      await toggleLikeClip(userId, clipId, "like");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error posting notification:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("listenToLikes", () => {
    it("calls callback with likes count from snapshot", () => {
      const unsubscribe = jest.fn();
      const callback = jest.fn();

      const mockDocSnap = {
        exists: () => true,
        data: () => ({ likesCount: 42 }),
      };

      (onSnapshot as jest.Mock).mockImplementation((_ref, handler) => {
        handler(mockDocSnap);
        return unsubscribe;
      });

      const result = listenToLikes(clipId, callback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(42);
      expect(result).toBe(unsubscribe);
    });

    it("does nothing if doc does not exist", () => {
      const callback = jest.fn();
      (onSnapshot as jest.Mock).mockImplementation((_ref, handler) => {
        handler({ exists: () => false });
      });

      listenToLikes(clipId, callback);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("listenToComments", () => {
    it("calls callback with formatted comments", () => {
      const unsubscribe = jest.fn();
      const callback = jest.fn();
      const mockDate = new Date();

      const mockSnapshot = {
        docs: [
          {
            id: "c1",
            data: () => ({
              userId: "user-1",
              text: "Nice clip",
              createdAt: { toDate: () => mockDate },
              displayName: "John",
              photoURL: "http://example.com/photo.jpg",
            }),
          },
        ],
      };

      (onSnapshot as jest.Mock).mockImplementation((_q, handler) => {
        handler(mockSnapshot);
        return unsubscribe;
      });

      const result = listenToComments(clipId, callback);

      expect(result).toBe(unsubscribe);
      expect(callback).toHaveBeenCalledWith([
        {
          id: "c1",
          userId: "user-1",
          text: "Nice clip",
          createdAt: mockDate,
          displayName: "John",
          photoURL: "http://example.com/photo.jpg",
        },
      ]);
    });
  });

  describe("addComment", () => {
    const mockUser = {
      uid: "user-1",
      displayName: "John",
      username: "johnny",
      photoURL: "http://example.com/photo.jpg",
    };

    it("does not add comment if user uid is missing", async () => {
      await addComment(clipId, { ...mockUser, uid: undefined }, "Hello");
      expect(addDoc).not.toHaveBeenCalled();
    });

    it("adds comment and sends notification", async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: "new-comment" });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ uploadedBy: "uploader-1" }),
      });
      (authFetch as jest.Mock).mockResolvedValue({ ok: true });

      const result = await addComment(clipId, mockUser, "Hello");

      expect(addDoc).toHaveBeenCalled();
      expect(authFetch).toHaveBeenCalledWith(
        "/api/notifications/create",
        expect.any(Object)
      );
      expect(result).toEqual({ id: "new-comment" });
    });

    it("returns comment doc without notification if clip does not exist", async () => {
      const mockDoc = { id: "new-comment" };
      (addDoc as jest.Mock).mockResolvedValue(mockDoc);
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

      const result = await addComment(clipId, mockUser, "Hello");

      expect(result).toEqual(mockDoc);
      expect(authFetch).not.toHaveBeenCalled();
    });

    it("logs error if addDoc throws", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      (addDoc as jest.Mock).mockRejectedValue(new Error("Firestore error"));

      await addComment(clipId, mockUser, "Hello");

      expect(consoleSpy).toHaveBeenCalledWith("Firestore error");

      consoleSpy.mockRestore();
    });
  });

  describe("deleteComment", () => {
    it("calls deleteDoc with correct path", async () => {
      (deleteDoc as jest.Mock).mockResolvedValue({});

      await deleteComment(clipId, "c1");

      expect(doc).toHaveBeenCalledWith(expect.anything(), "clips", clipId, "comments", "c1");
      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});

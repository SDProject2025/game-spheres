import { POST, GET } from "./route";
import { NextRequest } from "next/server";

// Mock Firebase Admin Config (our Firestore db instance)
jest.mock("@/config/firebaseAdminConfig", () => {
  const mockGet = jest.fn();
  const mockSet = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  // docRef
  const mockDoc = jest.fn(() => ({
    get: mockGet,
    set: mockSet,
    update: mockUpdate,
    delete: mockDelete,
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: mockGet,
        set: mockSet,
        update: mockUpdate,
        delete: mockDelete,
      })),
    })),
  }));

  return {
    db: {
      collection: jest.fn(() => ({ doc: mockDoc })),
      runTransaction: jest.fn(),
    },
    __mocks: { mockGet, mockSet, mockUpdate, mockDelete, mockDoc },
  };
});

// Mock Firestore FieldValue
jest.mock("firebase-admin", () => ({
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn(() => "MOCK_TIMESTAMP"),
      increment: jest.fn((n) => `INCREMENT(${n})`),
    },
  },
}));

describe("Likes API", () => {
  const { db, __mocks } = require("@/config/firebaseAdminConfig");
  const { mockGet, mockSet, mockUpdate, mockDelete } = __mocks;

  const mockUserId = "user123";
  const mockClipId = "clip123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("returns 400 if missing fields", async () => {
      const req = { json: jest.fn().mockResolvedValue({}) } as unknown as NextRequest;
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe("User ID, Clip ID, or action not provided");
    });

    it("returns 400 if action is invalid", async () => {
        const req = new NextRequest("http://localhost", {
            method: "POST",
            body: JSON.stringify({ userId: mockUserId, clipId: mockClipId, action: "invalid" }),
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.error).toBe("Invalid Action");
    });

    it("likes a clip", async () => {
      (db.runTransaction as jest.Mock).mockImplementation(async (cb) =>
        cb({
          get: jest.fn().mockResolvedValue({ exists: false }),
          set: mockSet,
          update: mockUpdate,
        })
      );

      const req = new NextRequest("http://localhost", {
        method: "POST",
        body: JSON.stringify({ userId: mockUserId, clipId: mockClipId, action: "like" }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(db.runTransaction).toHaveBeenCalled();
    });

    it("unlikes a clip", async () => {
      (db.runTransaction as jest.Mock).mockImplementation(async (cb) =>
        cb({
          get: jest.fn().mockResolvedValue({ exists: true }),
          delete: mockDelete,
          update: mockUpdate,
        })
      );

      const req = new NextRequest("http://localhost", {
        method: "POST",
        body: JSON.stringify({ userId: mockUserId, clipId: mockClipId, action: "unlike" }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it("handles errors gracefully", async () => {
      (db.runTransaction as jest.Mock).mockImplementation(async (cb) =>
        cb({
          get: jest.fn().mockRejectedValue(new Error("Firestore exploded")),
        }),
      );

      const req = new NextRequest("http://localhost", {
        method: "POST",
        body: JSON.stringify({ userId: mockUserId, clipId: mockClipId, action: "unlike" }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.error).toBe("Updating like status failed");
    });
  });

  describe("GET", () => {
    it("returns 400 if missing query params", async () => {
      const req = { url: "http://localhost/api/likes" } as unknown as NextRequest;
      const res = await GET(req);
      expect(res.status).toBe(400);
    });

    it("returns isLiked true if doc exists", async () => {
      mockGet.mockResolvedValueOnce({ exists: true });

      const req = {
        url: `http://localhost/api/likes?userId=${mockUserId}&clipId=${mockClipId}`,
      } as unknown as NextRequest;

      const res = await GET(req);
      const body = await res.json();

      expect(body.isLiked).toBe(true);
    });

    it("returns isLiked false if doc does not exist", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });

      const req = {
        url: `http://localhost/api/likes?userId=${mockUserId}&clipId=${mockClipId}`,
      } as unknown as NextRequest;

      const res = await GET(req);
      const body = await res.json();

      expect(body.isLiked).toBe(false);
    });

    it("handles errors gracefully", async () => {
      mockGet.mockRejectedValue(new Error("Firestore exploded"));

      const req = {
        url: `http://localhost/api/likes?userId=${mockUserId}&clipId=${mockClipId}`,
      } as unknown as NextRequest;

      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.error).toBe("Failed to check like status");
    });
  });
});

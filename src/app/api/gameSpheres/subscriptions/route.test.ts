import { GET, POST } from "./route";
import { NextRequest } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import { decodeToken } from "../../decodeToken";
import admin from "firebase-admin";

jest.mock("@/config/firebaseAdminConfig", () => ({
  db: {
    collection: jest.fn(),
  },
}));

jest.mock("../../decodeToken", () => ({
  decodeToken: jest.fn(),
}));

jest.mock("firebase-admin", () => ({
  firestore: {
    FieldValue: {
      arrayUnion: jest.fn((val) => val),
      arrayRemove: jest.fn((val) => val),
    },
  },
}));

describe("Subscription API", () => {
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockBatch: { update: jest.Mock; commit: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockUpdate = jest.fn();
    mockDoc = jest.fn((id) => ({
      get: mockGet,
      path: `gamespheres/${id}`,
    }));

    const mockCollection = jest.fn(() => ({
      doc: mockDoc,
    }));

    db.collection = mockCollection as jest.Mock;

    mockBatch = {
      update: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };
    (db as any).batch = jest.fn(() => mockBatch);
  });

  describe("GET", () => {
    it("returns isSubscribed true if user is subscribed", async () => {
      (decodeToken as jest.Mock).mockResolvedValue("user123");
      const mockUserSnap = {
        exists: true,
        data: () => ({
          gsSubs: [{ path: "gamespheres/gs1" }],
        }),
      };
      mockGet.mockResolvedValueOnce(mockUserSnap);

      const mockReq = {
        url: "http://localhost/api?gameSphereId=gs1",
        headers: {
            get: jest.fn().mockReturnValue("token"),
        }
      } as unknown as NextRequest;

      const res = await GET(mockReq);
      const json = await res.json();

      expect(json).toEqual({ isSubscribed: true });
    });

    it("returns isSubscribed false if user is not subscribed", async () => {
      (decodeToken as jest.Mock).mockResolvedValue("user123");
      const mockUserSnap = {
        exists: true,
        data: () => ({
          gsSubs: [{ path: "gamespheres/other" }],
        }),
      };
      mockGet.mockResolvedValueOnce(mockUserSnap);

      const mockReq = {
        url: "http://localhost/api?gameSphereId=gs1",
        headers: new Map(),
      } as unknown as NextRequest;

      const res = await GET(mockReq);
      const json = await res.json();

      expect(json).toEqual({ isSubscribed: false });
    });

    it("returns 401 if decodeToken fails", async () => {
      (decodeToken as jest.Mock).mockResolvedValue(null);

      const mockReq = {
        url: "http://localhost/api?gameSphereId=gs1",
        headers: new Map(),
      } as unknown as NextRequest;

      const res = await GET(mockReq);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.message).toBe("Unauthorized");
    });

    it("returns 404 if gameSphereId missing", async () => {
      (decodeToken as jest.Mock).mockResolvedValue("user123");

      const mockReq = {
        url: "http://localhost/api",
        headers: new Map(),
      } as unknown as NextRequest;

      const res = await GET(mockReq);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toBe("User Not Found");
    });
  });

  describe("POST", () => {
    it("subscribes a user successfully", async () => {
      (decodeToken as jest.Mock).mockResolvedValue("user123");

      const reqBody = JSON.stringify({
        gameSphereId: "gs1",
        action: "subscribe",
      });

      const mockReq = {
        headers: new Map([["Authorization", "token"]]),
        json: jest.fn().mockResolvedValue(JSON.parse(reqBody)),
      } as unknown as NextRequest;

      const res = await POST(mockReq);
      const json = await res.json();

      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
      expect(json.success).toBe(true);
      expect(json.isSubscribed).toBe(true);
    });

    it("unsubscribes a user successfully", async () => {
      (decodeToken as jest.Mock).mockResolvedValue("user123");

      const reqBody = JSON.stringify({
        gameSphereId: "gs1",
        action: "unsubscribe",
      });

      const mockReq = {
        headers: new Map([["Authorization", "token"]]),
        json: jest.fn().mockResolvedValue(JSON.parse(reqBody)),
      } as unknown as NextRequest;

      const res = await POST(mockReq);
      const json = await res.json();

      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
      expect(json.success).toBe(true);
      expect(json.isSubscribed).toBe(false);
    });

    it("returns 401 if decodeToken fails", async () => {
      (decodeToken as jest.Mock).mockResolvedValue(null);

      const mockReq = {
        headers: new Map(),
        json: jest.fn(),
      } as unknown as NextRequest;

      const res = await POST(mockReq);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.message).toBe("Unauthorized");
    });

    it("returns 400 if required fields missing", async () => {
      (decodeToken as jest.Mock).mockResolvedValue("user123");

      const mockReq = {
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
      } as unknown as NextRequest;

      const res = await POST(mockReq);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe("UserID, GameSphereID, and Action are required");
    });

    it("returns 400 if invalid action", async () => {
      (decodeToken as jest.Mock).mockResolvedValue("user123");

      const reqBody = JSON.stringify({
        gameSphereId: "gs1",
        action: "invalid",
      });

      const mockReq = {
        headers: new Map(),
        json: jest.fn().mockResolvedValue(JSON.parse(reqBody)),
      } as unknown as NextRequest;

      const res = await POST(mockReq);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe("Invalid Action");
    });
  });
});

import { POST } from "./route";
import { db } from "@/config/firebaseAdminConfig";
import { decodeToken } from "../../decodeToken";
import { NextRequest } from "next/server";

jest.mock("@/config/firebaseAdminConfig", () => ({
  db: {
    collection: jest.fn(),
  },
}));

jest.mock("../../decodeToken", () => ({
  decodeToken: jest.fn(),
}));

describe("POST /api/profile/update", () => {
  const mockUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockDoc = jest.fn(() => ({
      update: mockUpdate,
    }));

    (db.collection as jest.Mock).mockReturnValue({
      doc: mockDoc,
    });
  });

  it("returns 401 if no valid UID", async () => {
    (decodeToken as jest.Mock).mockResolvedValue(null);

    const mockReq = {
      headers: {
        get: jest.fn(() => null),
      },
      json: jest.fn(),
    } as unknown as NextRequest;

    const res = await POST(mockReq);
    const json = await res.json();

    expect(json.message).toBe("Unauthorized");
    expect(res.status).toBe(401);
  });

  it("returns 400 if body is missing", async () => {
    (decodeToken as jest.Mock).mockResolvedValue("uid123");

    const mockReq = {
      headers: {
        get: jest.fn(() => "Bearer token"),
      },
      json: jest.fn(async () => null),
    } as unknown as NextRequest;

    const res = await POST(mockReq);
    const json = await res.json();

    expect(json.message).toBe("Missing post body");
    expect(res.status).toBe(400);
  });

  it("updates profile and returns success", async () => {
    (decodeToken as jest.Mock).mockResolvedValue("uid123");

    const profile = {
      uid: "uid123",
      displayName: "Test User",
      username: "testuser",
      bio: "My bio",
      photoURL: "https://example.com/photo.png",
    };

    const mockReq = {
      headers: {
        get: jest.fn(() => "Bearer token"),
      },
      json: jest.fn(async () => profile),
    } as unknown as NextRequest;

    const res = await POST(mockReq);
    const json = await res.json();

    expect(db.collection).toHaveBeenCalledWith("users");
    expect(mockUpdate).toHaveBeenCalledWith({
      displayName: profile.displayName,
      username: profile.username,
      bio: profile.bio,
      photoURL: profile.photoURL,
    });
    expect(json.success).toBe(true);
  });

  it("returns 500 if update fails", async () => {
    (decodeToken as jest.Mock).mockResolvedValue("uid123");
    const errorMessage = "Update failed";

    const profile = {
      uid: "uid123",
      displayName: "Test User",
      username: "testuser",
      bio: "My bio",
      photoURL: "https://example.com/photo.png",
    };

    const mockReq = {
      headers: {
        get: jest.fn(() => "Bearer token"),
      },
      json: jest.fn(async () => profile),
    } as unknown as NextRequest;

    const mockDoc = jest.fn(() => ({
      update: jest.fn(() => {
        throw new Error(errorMessage);
      }),
    }));

    (db.collection as jest.Mock).mockReturnValue({
      doc: mockDoc,
    });

    const res = await POST(mockReq);
    const json = await res.json();

    expect(json.message).toBe(errorMessage);
    expect(res.status).toBe(500);
  });
});

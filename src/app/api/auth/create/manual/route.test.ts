import { GET, POST } from "./route";
import { NextRequest } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import { decodeToken } from "@/app/api/decodeToken";

jest.mock("@/config/firebaseAdminConfig", () => {
  const mockGet = jest.fn();
  const mockWhere = jest.fn().mockReturnValue({ get: mockGet });
  const mockSelect = jest.fn().mockReturnValue({ where: mockWhere });
  const mockSet = jest.fn();
  const mockDoc = jest.fn().mockReturnValue({
    set: mockSet,
  });
  const mockCollection = jest.fn().mockReturnValue({
    select: mockSelect,
    where: mockWhere,
    doc: mockDoc,
  });

  return {
    db: {
      collection: mockCollection,
    },
  };
});

jest.mock("@/app/api/decodeToken");

describe("SignUp Manual API", () => {
  let mockedGet: jest.Mock;
  let mockedCollection: jest.Mock;
  let mockedDoc: jest.Mock;
  let mockedSet: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedCollection = db.collection;
    mockedGet = db.collection().select().where().get;
    mockedDoc = db.collection().doc;
    mockedSet = mockedDoc().set;
  });

  describe("GET", () => {
    it("returns 400 if username is missing", async () => {
      const mockReq = {
        nextUrl: { searchParams: new URLSearchParams() },
      } as unknown as NextRequest;

      const response = await GET(mockReq);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ message: "Missing username" });
    });

    it("returns 200 if username is available", async () => {
      mockedGet.mockResolvedValueOnce({ empty: true });

      const mockReq = {
        nextUrl: { searchParams: new URLSearchParams({ username: "testUser" }) },
      } as unknown as NextRequest;

      const response = await GET(mockReq);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Username available");
    });

    it("returns 409 if username is taken", async () => {
      mockedGet.mockResolvedValueOnce({ empty: false });

      const mockReq = {
        nextUrl: { searchParams: new URLSearchParams({ username: "takenUser" }) },
      } as unknown as NextRequest;

      const response = await GET(mockReq);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.message).toBe("Username taken");
    });
  });

  describe("POST", () => {
    it("returns 401 if no auth token", async () => {
      (decodeToken as jest.Mock).mockResolvedValue(null);

      const mockReq = {
        headers: { get: jest.fn().mockReturnValue(null) },
        json: jest.fn(),
      } as unknown as NextRequest;

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe("Unauthorized");
    });

    it("returns 400 if required fields missing", async () => {
      (decodeToken as jest.Mock).mockResolvedValue("uid123");

      const mockReq = {
        headers: { get: jest.fn() },
        json: jest.fn().mockResolvedValue({}),
      } as unknown as NextRequest;

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Missing required fields");
    });

    it("returns 409 if username is taken", async () => {
      (decodeToken as jest.Mock).mockResolvedValue("uid123");
      mockedGet.mockResolvedValueOnce({ empty: false });

      const mockReq = {
        headers: { get: jest.fn() },
        json: jest.fn().mockResolvedValue({
          username: "takenUser",
          displayName: "Test User",
          email: "test@example.com",
        }),
      } as unknown as NextRequest;

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.message).toBe("Username is taken");
    });

    it("returns 200 on successful signup", async () => {
      (decodeToken as jest.Mock).mockResolvedValue("uid123");
      mockedGet.mockResolvedValueOnce({ empty: true });
      mockedSet.mockResolvedValueOnce(undefined);

      const mockReq = {
        headers: { get: jest.fn() },
        json: jest.fn().mockResolvedValue({
          username: "newUser",
          displayName: "Test User",
          email: "test@example.com",
        }),
      } as unknown as NextRequest;

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("User created successfully");
      expect(mockedSet).toHaveBeenCalledWith({
        username: "newUser",
        displayName: "Test User",
        email: "test@example.com",
        followers: [],
        following: [],
        gsSubs: [],
        photoURL:
          "https://firebasestorage.googleapis.com/v0/b/game-spheres.firebasestorage.app/o/profilePhotos%2Fdefault_avatar.png?alt=media&token=e9eb0302-6064-4757-9c81-227a32f45b54",
        savedClips: [],
      });
    });

    it("logs error if signup fails", async () => {
      (decodeToken as jest.Mock).mockResolvedValue("uid123");
      mockedGet.mockResolvedValueOnce({ empty: true });
      mockedSet.mockRejectedValueOnce(new Error("Set failed"));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const mockReq = {
        headers: { get: jest.fn() },
        json: jest.fn().mockResolvedValue({
          username: "newUser",
          displayName: "Test User",
          email: "test@example.com",
        }),
      } as unknown as NextRequest;

      const response = await POST(mockReq);
      await response.json();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Sign up error:",
        expect.any(Error)
      );
    });
  });
});

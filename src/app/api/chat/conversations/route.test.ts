import { NextRequest } from "next/server";

const mockGet = jest.fn();
const mockDoc = jest.fn(() => ({ get: mockGet }));
const mockCollection = jest.fn(() => ({ doc: mockDoc }));

jest.mock("@/config/firebaseAdminConfig", () => ({
  db: {
    collection: mockCollection,
  },
}));

import { GET } from "./route";

describe("GET /api/chat/conversations", () => {
  const BASE_URL = "http://localhost/api/chat/conversations";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 if uid is missing", async () => {
    const mockReq = {
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest;

    const response = await GET(mockReq);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Missing uid");
  });

  it("returns conversations if user exists", async () => {
    mockGet.mockResolvedValue({
      data: () => ({ conversations: ["c1", "c2"] }),
    });

    const mockReq = {
      nextUrl: { searchParams: new URLSearchParams([["uid", "user123"]]) },
    } as unknown as NextRequest;

    const response = await GET(mockReq);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ conversations: ["c1", "c2"] });
    expect(mockCollection).toHaveBeenCalledWith("users");
    expect(mockDoc).toHaveBeenCalledWith("user123");
  });
  it("returns 500 and correct error message when Firestore throws an error", async () => {
    mockGet.mockRejectedValue(new Error("Firestore error"));

    const mockReq = {
      nextUrl: { searchParams: new URLSearchParams([["uid", "user123"]]) },
    } as unknown as NextRequest;

    const response = await GET(mockReq);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ message: "Firestore error" });

    expect(mockCollection).toHaveBeenCalled();
    expect(mockDoc).toHaveBeenCalledWith("user123");
  });
});

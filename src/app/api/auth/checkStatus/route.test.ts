import { GET } from "./route";
import { NextRequest } from "next/server";

jest.mock("@/config/firebaseAdminConfig", () => {
  const mockGet = jest.fn();
  const mockDoc = jest.fn(() => ({ get: mockGet }));
  const mockCollection = jest.fn(() => ({ doc: mockDoc }));
  return { db: { collection: mockCollection }, __mockGet: mockGet };
});

import { db, __mockGet } from "@/config/firebaseAdminConfig";

describe("CheckStatus API", () => {
  let mockReq: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 if uid is missing", async () => {
    mockReq = { nextUrl: { searchParams: new URLSearchParams() } } as unknown as NextRequest;
    const response = await GET(mockReq);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Missing uid");
  });

  it("returns 200 if user is verified", async () => {
    __mockGet.mockResolvedValue({ get: (field: string) => (field === "verified" ? true : null) });

    mockReq = { nextUrl: { searchParams: new URLSearchParams({ uid: "123" }) } } as unknown as NextRequest;
    const response = await GET(mockReq);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("User verified");
  });

  it("returns 401 if user is not verified", async () => {
    __mockGet.mockResolvedValue({ get: (field: string) => (field === "verified" ? false : null) });

    mockReq = { nextUrl: { searchParams: new URLSearchParams({ uid: "456" }) } } as unknown as NextRequest;
    const response = await GET(mockReq);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe("User not verified");
  });
});

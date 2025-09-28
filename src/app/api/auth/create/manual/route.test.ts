import { GET } from "./route";
import { NextRequest } from "next/server";
import { db } from "@/config/firebaseAdminConfig";

jest.mock("@/config/firebaseAdminConfig", () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn(),
  },
}));

describe("SignUp Manual API › GET", () => {
  let mockedGet: jest.Mock;

  beforeEach(() => {
    mockedGet = db.collection().select().where().get as jest.Mock;
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

  it("returns 400 if username is missing", async () => {
    const mockReq = {
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest;

    const response = await GET(mockReq);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Missing username");
  });
});

import { GET } from "./route";
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

function createRequest(headers: Record<string, string> = {}) {
  return {
    headers: {
      get: (key: string) => headers[key] ?? null,
    },
  } as unknown as NextRequest;
}

describe("GET /notifications", () => {
  const mockGet = jest.fn();
  const mockOrderBy = jest.fn(() => ({ get: mockGet }));
  const mockCollection = jest.fn(() => ({
    doc: jest.fn(() => ({
      collection: jest.fn(() => ({
        orderBy: mockOrderBy,
      })),
    })),
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    (db.collection as jest.Mock).mockImplementation(mockCollection);
  });

  it("returns 401 if no uid from token", async () => {
    (decodeToken as jest.Mock).mockResolvedValue(null);

    const req = createRequest({ Authorization: "Bearer bad" });
    const res = await GET(req);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ message: "Unauthorized" });
  });

  it("returns 200 with notifications data", async () => {
    (decodeToken as jest.Mock).mockResolvedValue("uid123");

    const mockDocs = [
      {
        id: "notif1",
        data: () => ({
          type: "like",
          createdAt: { toMillis: () => 123456 },
          toUid: "uid123",
        }),
      },
      {
        id: "notif2",
        data: () => ({
          type: "comment",
          createdAt: { toMillis: () => 654321 },
          toUid: "uid123",
          commentId: "c123",
        }),
      },
    ];

    mockGet.mockResolvedValueOnce({ docs: mockDocs });

    const req = createRequest({ Authorization: "Bearer good" });
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.notificationsData).toEqual([
      {
        notificationId: "notif1",
        type: "like",
        createdAt: 123456,
        toUid: "uid123",
      },
      {
        notificationId: "notif2",
        type: "comment",
        createdAt: 654321,
        toUid: "uid123",
        commentId: "c123",
      },
    ]);
  });

  it("returns 200 with empty array if no docs", async () => {
    (decodeToken as jest.Mock).mockResolvedValue("uid123");

    mockGet.mockResolvedValueOnce({ docs: [] });

    const req = createRequest({ Authorization: "Bearer good" });
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.notificationsData).toEqual([]);
  });

  it("returns 500 if db.get throws", async () => {
    (decodeToken as jest.Mock).mockResolvedValue("uid123");

    mockGet.mockRejectedValueOnce(new Error("db error"));

    const req = createRequest({ Authorization: "Bearer good" });
    const res = await GET(req);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ message: "db error" });
  });
});

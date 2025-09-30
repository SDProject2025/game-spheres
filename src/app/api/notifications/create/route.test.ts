import { POST } from "./route";
import { db } from "@/config/firebaseAdminConfig";
import { decodeToken } from "../../decodeToken";
import { NextRequest } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

jest.mock("@/config/firebaseAdminConfig", () => ({
  db: {
    collection: jest.fn(),
  },
}));

jest.mock("../../decodeToken", () => ({
  decodeToken: jest.fn(),
}));

function createRequest(body: any, headers: Record<string, string> = {}) {
  return {
    headers: {
      get: (key: string) => headers[key] ?? null,
    },
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

describe("POST /notifications", () => {
  const mockAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          add: mockAdd,
        }),
      }),
    });
  });

  it("returns 401 if no uid from token", async () => {
    (decodeToken as jest.Mock).mockResolvedValue(null);

    const req = createRequest({}, { Authorization: "Bearer bad" });
    const res = await POST(req);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ message: "Unauthorized" });
  });

  it("returns 400 if invalid JSON", async () => {
    (decodeToken as jest.Mock).mockResolvedValue("uid123");

    const badReq = {
      headers: { get: () => "Bearer good" },
      json: jest.fn().mockRejectedValue(new Error("bad json")),
    } as unknown as NextRequest;

    const res = await POST(badReq);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: "Invalid JSON" });
  });

  it("returns 400 if missing recipient", async () => {
    (decodeToken as jest.Mock).mockResolvedValue("uid123");

    const req = createRequest({});
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: "Missing recipient (toUid)" });
  });

  it("returns 400 if type=comment but no commentId", async () => {
    (decodeToken as jest.Mock).mockResolvedValue("uid123");

    const req = createRequest({ toUid: "other", type: "comment" });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      message: "Missing commentId for comment notification",
    });
  });

  it("returns 201 and saves notification successfully", async () => {
    (decodeToken as jest.Mock).mockResolvedValue("uid123");
    mockAdd.mockResolvedValueOnce({ id: "newNotifId" });

    const req = createRequest({ toUid: "other", type: "like" });
    const res = await POST(req);

    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        toUid: "other",
        type: "like",
        createdAt: expect.any(Timestamp),
        read: false,
      })
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ message: "Notification created" });
  });

  it("returns 500 if db.add throws", async () => {
    (decodeToken as jest.Mock).mockResolvedValue("uid123");
    mockAdd.mockRejectedValueOnce(new Error("db error"));

    const req = createRequest({ toUid: "other", type: "like" });
    const res = await POST(req);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ message: "Internal server error" });
  });
});

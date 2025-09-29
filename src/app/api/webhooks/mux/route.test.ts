import { POST } from "./route";
import crypto from "crypto";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { NextRequest } from "next/server";

jest.mock("@/config/firebaseConfig", () => {
  return {
    db: {},
  };
});

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
}));

const mockHmacUpdate = jest.fn();
const mockHmacDigest = jest.fn();

jest.spyOn(crypto, "createHmac").mockImplementation(() => {
  return {
    update: mockHmacUpdate.mockReturnThis(),
    digest: mockHmacDigest,
  } as any;
});

jest.spyOn(crypto, "timingSafeEqual").mockImplementation((a, b) => {
  return a.toString() === b.toString();
});

describe("Mux Webhook POST handler", () => {
  const mockAssetData = {
    id: "asset123",
    playback_ids: [{ id: "playback456" }],
    duration: 120,
    aspect_ratio: "16:9",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MUX_WEBHOOK_SECRET = "test_secret";

    //this ensures doc() returns a valid reference instead of undefined
    (doc as jest.Mock).mockImplementation(() => ({ id: "mockDocRef" }));
  });

  const createRequest = (body: object | string, signature: string | null) => {
    const bodyString = typeof body === "string" ? body : JSON.stringify(body);
    return {
      text: jest.fn().mockResolvedValue(bodyString),
      headers: {
        get: jest.fn().mockImplementation((key) =>
          key === "mux-signature" ? signature : null
        ),
      },
    } as unknown as NextRequest;
  };

  it("should return 401 if signature is missing", async () => {
    const req = createRequest({ type: "video.asset.ready", data: mockAssetData }, null);

    const res = await POST(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json).toEqual({ error: "Invalid Signature" });
  });

it("should return 401 if signature verification fails", async () => {

  mockHmacDigest.mockReturnValueOnce("abcdef1234567890abcdef1234567890");

  const req = createRequest(
    { type: "video.asset.ready", data: mockAssetData },
    "t=123,v1=deadbeefdeadbeefdeadbeefdeadbeef" //mismatched hash obv
  );

  const res = await POST(req);
  expect(res.status).toBe(401);

  const json = await res.json();
  expect(json).toEqual({ error: "Invalid Signature" });
});


  it("should handle video.asset.ready and update Firestore", async () => {
    // Simulate matching signature (hmac match)
    mockHmacDigest.mockReturnValueOnce("expected_hash");

    const mockDocRef = { id: "clip123" };
    (getDocs as jest.Mock).mockResolvedValueOnce({
      empty: false,
      docs: [mockDocRef],
    });

    const req = createRequest(
      { type: "video.asset.ready", data: mockAssetData },
      "t=123,v1=expected_hash"
    );

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });

    // Verify Firestore functions were called correctly
    expect(collection).toHaveBeenCalledWith(expect.anything(), "clips");
    expect(where).toHaveBeenCalledWith("muxAssetId", "==", "asset123");
    expect(query).toHaveBeenCalled();

    // Verify updateDoc was called with correct data
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), {
      processingStatus: "ready",
      muxPlaybackId: "playback456",
      duration: 120,
      aspectRatio: "16:9",
      thumbnailUrl:
        "https://image.mux.com/playback456/thumbnail.png?width=640&height=360&fit_mode=preserve",
    });
  });

  it("should handle video.asset.errored and mark status as errored", async () => {

    mockHmacDigest.mockReturnValueOnce("expected_hash");

    const mockDocRef = { id: "clip123" };
    (getDocs as jest.Mock).mockResolvedValueOnce({
      empty: false,
      docs: [mockDocRef],
    });

    const req = createRequest(
      { type: "video.asset.errored", data: mockAssetData },
      "t=123,v1=expected_hash"
    );

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });

    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), {
      processingStatus: "errored",
    });
  });

  it("should return 500 if JSON parsing fails", async () => {
    //this simulates an invalid JSON payload so JSON.parse throws
    mockHmacDigest.mockReturnValueOnce("expected_hash");

    const badReq = createRequest("INVALID_JSON", "t=123,v1=expected_hash");

    const res = await POST(badReq);

    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json).toEqual({ error: "Webook failed" });
  });
});

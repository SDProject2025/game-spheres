import { POST, GET } from './route';
import { NextRequest } from 'next/server';

// Mock Firebase Admin Config (our Firestore db instance)
jest.mock("@/config/firebaseAdminConfig", () => {
    const mockGet = jest.fn();
    const mockUpdate = jest.fn();

    // docRef
    const mockCollection = jest.fn(() => ({
        doc: jest.fn(() => ({
                get: mockGet,
                update: mockUpdate,
        })),
    }));

    return {
        db: {
            collection: mockCollection,
        },
        __mocks: { mockGet, mockUpdate, mockCollection },
    };
});

// Mock Firestore FieldValue
jest.mock("firebase-admin", () => ({
    firestore: {
        FieldValue: {
            arrayUnion: jest.fn((clipId) => `arrayUnion(${clipId})`),
            arrayRemove: jest.fn((clipId) => `arrayRemove(${clipId})`),
        },
    },
}));

describe("Saved Clips API", () => {
    const { db, __mocks } = require("@/config/firebaseAdminConfig");
    const { mockGet, mockUpdate } = __mocks;

    const mockUserId = "user123";
    const mockClipId = "clip123";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /clips/savedClips", () => {
        it("returns 400 if there are missing fields", async () => {
            const req = new NextRequest("http://localhost", {
                method: "POST",
                body: JSON.stringify({}),
            });

            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.error).toBe("User ID, Clip ID, or action not given");
        });

        it("returns 400 if action is invalid", async () => {
            const req = new NextRequest("http://localhost", {
                method: "POST",
                body: JSON.stringify({ userId: mockUserId, clipId: mockClipId, action: "Invalid" }),
            });

            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.error).toBe("Invalid Action");
        });

        it("saves a clip", async () => {
            const req = new NextRequest("http://localhost", {
                method: "POST",
                body: JSON.stringify({ userId: mockUserId, clipId: mockClipId, action: "save" }),
            });

            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.success).toBe(true);
            expect(mockUpdate).toHaveBeenCalledWith({
                savedClips: `arrayUnion(${mockClipId})`,
            });
        });

        it("unsaves a clip", async () => {
            const req = new NextRequest("http://localhost", {
                method: "POST",
                body: JSON.stringify({ userId: mockUserId, clipId: mockClipId, action: "unsave" }),
            });

            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.success).toBe(true);
            expect(mockUpdate).toHaveBeenCalledWith({
                savedClips: `arrayRemove(${mockClipId})`,
            });
        });

        it("handles errors gracefully", async () => {
            mockUpdate.mockRejectedValue(new Error("Firestore exploded"));

            const req = new NextRequest("http://localhost", {
            method: "POST",
            body: JSON.stringify({ userId: mockUserId, clipId: mockClipId, action: "save" }),
            });
    
            const res = await POST(req);
            const body = await res.json();
    
            expect(res.status).toBe(500);
            expect(body.error).toBe("Updating clip save status failed");
        });
    });

    describe("GET /clips/savedClips", () => {
        it("returns 400 if missing fields", async () => {
            const req = {
                url: "http://localhost/api/savedClips",
            } as unknown as NextRequest;

            const res = await GET(req);
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.error).toBe("Error: User and/or Clip ID not provided");
        });

        it("returns 404 if user not found", async () => {
            mockGet.mockResolvedValueOnce({ exists: false });

            const req = {
                url: `http://localhost/api/savedClips?userId=${mockUserId}&clipId=${mockClipId}`,
            } as unknown as NextRequest;

            const res = await GET(req);
            const body = await res.json();

            expect(res.status).toBe(404);
            expect(body.error).toBe("User not found");
        });

        it("returns isSaved true is clip is saved", async () => {
            mockGet.mockResolvedValueOnce({
                exists: true,
                data: () => ({ savedClips: [mockClipId, "clip123"] }),
            });

            const req = {
                url: `http://localhost/api/savedClips?userId=${mockUserId}&clipId=${mockClipId}`,
            } as unknown as NextRequest;

            const res = await GET(req);
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.isSaved).toBe(true);
        });

        it("handles errors gracefully", async () => {
            mockGet.mockRejectedValue(new Error("Firestore exploded"));

            const req = {
                url: `http://localhost/api/savedClips?userId=${mockUserId}&clipId=${mockClipId}`,
            } as unknown as NextRequest;

            const res = await GET(req);
            const body = await res.json();

            expect(res.status).toBe(500);
            expect(body.error).toBe("Failed to check saved status");
        });
    });
});
import { POST } from './route';
import { NextRequest } from 'next/server';

//Firestore Mock
jest.mock("firebase/firestore", () => ({
    collection: jest.fn(() => "mockCollection"),
    addDoc: jest.fn(async () => ({ id: "mockDocId"})),
}));

//Mux Mock
jest.mock("@/config/muxConfig", () => ({
    mux: {
        video: {
            uploads: {
                retrieve: jest.fn(),
            },
            assets: {
                retrieve: jest.fn(),
            },
        },
    },
}));

//Firebase Mock
jest.mock("@/config/firebaseConfig", () => ({
    auth: jest.fn(),
    db: jest.fn(),
    googleProvider: jest.fn(),
    storage: jest.fn(),
}));

describe("POST /finalizeUpload", () => {
    const { mux } = require("@/config/muxConfig");
    const { addDoc } = require("firebase/firestore");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns error if upload not complete", async () => {
        (mux.video.uploads.retrieve as jest.Mock).mockResolvedValue({ status: "in_progress "});

        const req = new NextRequest("http://localhost", {
            method: "POST",
            body: JSON.stringify({ upload: "123", caption: "test caption" }),
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.error).toBe("Upload not complete");
    });

    it("saves metadata and returns success when upload complete", async () => {
        (mux.video.uploads.retrieve as jest.Mock).mockResolvedValue({ 
            status: "asset_created", 
            asset_id: "asset123", 
        });

        (mux.video.assets.retrieve as jest.Mock).mockResolvedValue({
            passthrough: JSON.stringify({
                gameSphereId: "testgame",
                uploadedBy: "user1",
                originalFilename: "test.mp4",
            }),
        });

        const req = new NextRequest("http://localhost", {
            method: "POST",
            body: JSON.stringify({ uploadId: "123", caption: "test caption" }),
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(addDoc).toHaveBeenCalledWith("mockCollection", expect.any(Object));
        expect(body.success).toBe(true);
        expect(body.clipId).toBe("mockDocId");
    });

    it("should handle errors gracefully", async () => {
        (mux.video.uploads.retrieve as jest.Mock).mockRejectedValue(new Error("Mux Exploded"));

        const req = new NextRequest("http://localhost", {
            method: "POST",
            body: JSON.stringify({ uploadId: "123", caption: "test caption" }),
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.error).toBe("Failed to finalize upload");
    })
});
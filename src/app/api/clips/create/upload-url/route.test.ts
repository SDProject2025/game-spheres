import { POST } from "./route";
import { NextRequest } from "next/server";

//Mux Mock
jest.mock("@/config/muxConfig", () => ({
    mux: {
        video: {
            uploads: {
                create: jest.fn(),
            },
        },
    },
}));

describe("POST /finalise/upload-url", () => {
    const { mux } = require("@/config/muxConfig");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns uploadId and uploadUrl on success", async () => {
        (mux.video.uploads.create as jest.Mock).mockResolvedValue({
            id: "mockUploadId",
            url: "https://mux.test/upload",
        });

        const req = new NextRequest("http://localhost", {
            method: "POST",
            body: JSON.stringify({
                filename: "test.mp4",
                gameSphereId: "gs1",
                uploadedBy: "user1",
                caption: "test caption",
            }),
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual({
            uploadId: "mockUploadId",
            uploadUrl: "https://mux.test/upload",
        });
        expect(mux.video.uploads.create).toHaveBeenLastCalledWith(
            expect.objectContaining({
                cors_origin: "http://localhost:3000",
                new_asset_settings: expect.any(Object),
            })
        );
    });

    it("handles errors gracefully", async () => {
        (mux.video.uploads.create as jest.Mock).mockRejectedValue( new Error("Mux Exploded"));

        const req = new NextRequest("http://localhost", {
            method: "POST",
            body: JSON.stringify({
                filename: "test.mp4",
                gameSphereId: "gs1",
                uploadedBy: "user1",
                caption: "test caption",
            }),
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.error).toBe("Failed to create upload URL");
    });
});
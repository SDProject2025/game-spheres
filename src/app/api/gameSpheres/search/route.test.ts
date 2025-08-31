import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";
import { GET } from "./route";

jest.mock("@/config/firebaseAdminConfig", () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe("GET /api/gamespheres", () => {
    const mockCollection = db.collection as jest.Mock;

    it("returns game spheres on success", async () => {
        const mockDocs = [
            { id: "1", data: () => ({ name: "Game 1", genre: "RPG" }) },
            { id: "2", data: () => ({ name: "Game 2", genre: "FPS" }) },
        ];

        mockCollection.mockReturnValue({
            get: jest.fn().mockResolvedValue({ docs: mockDocs }),
        });

        const request = new NextRequest("http://localhost/api/gameSpheres");
        const response = await GET(request);

        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.gameSpheres).toEqual([
            { id: "1", name: "Game 1", genre: "RPG" },
            { id: "2", name: "Game 2", genre: "FPS" },
        ]);
    });

    it("should handle errors gracefully", async () => {
        mockCollection.mockReturnValue({
            get: jest.fn().mockRejectedValue(new Error("Firestore failure")),
        });

        const request = new NextRequest("http://localhost/api/gameSpheres");
        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.message).toBe("Firestore failure");
    });

    it("handles non-Error thrown values", async () => {
        mockCollection.mockReturnValue({
            get: jest.fn().mockRejectedValue("random string"),
        });

        const request = new NextRequest("https://localhost/api/gameSpheres");
        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.message).toBe("Internal Server Error");
    });
});
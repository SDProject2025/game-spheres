import { NextRequest } from "next/server";
import { POST } from "./route";
import { db } from "@/config/firebaseAdminConfig";

jest.mock("@/config/firebaseAdminConfig", () => ({
    db: {
        collection: jest.fn(),
    },
}));

describe("POST /api/profile/update", () => {
    const mockCollection = db.collection as jest.Mock;

    it("returns 400 if body is missing", async () => {
        const request =  {
            json: jest.fn().mockResolvedValue(null),
        } as unknown as NextRequest;

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.message).toBe("Missing post body");
    });

    it("updates profile successfully", async () => {
        const mockUpdate = jest.fn().mockResolvedValue({});
        const mockDoc = jest.fn().mockReturnValue({ update: mockUpdate });
        mockCollection.mockReturnValue({ doc: mockDoc });

        const profile = {
            uid: "uid123",
            displayName: "Test User",
            username: "testuser",
            bio: "testing is fun",
            photoURL: "https://photo.url",
        }

        const request = {
            json: jest.fn().mockResolvedValue(profile),
        } as unknown as NextRequest;

        const response = await POST(request);
        const body = await response.json();

        expect(mockCollection).toHaveBeenCalledWith("users");
        expect(mockDoc).toHaveBeenCalledWith("uid123");
        expect(mockUpdate).toHaveBeenCalledWith({
            displayName: "Test User",
            username: "testuser",
            bio: "testing is fun",
            photoURL: "https://photo.url",
        });
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
    });

    it("handles errors gracefully", async () => {
        const mockUpdate = jest.fn().mockRejectedValue(new Error("Update failed"));
        const mockDoc = jest.fn().mockReturnValue({ update: mockUpdate });
        mockCollection.mockReturnValue({ doc: mockDoc });

        const profile = { uid: "uid123" };

        const request = {
            json: jest.fn().mockResolvedValue(profile),
        } as unknown as NextRequest;

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.message).toBe("Update failed");
    });

    it("handles non-error thrown values", async () =>{
        const mockUpdate = jest.fn().mockRejectedValue("random string");
        const mockDoc = jest.fn().mockReturnValue({ update: mockUpdate });
        mockCollection.mockReturnValue({ doc: mockDoc });

        const profile = { uid: "uid123" };

        const request = {
            json: jest.fn().mockResolvedValue(profile),
        } as unknown as NextRequest;

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.message).toBe("Error updating profile");
    });
});
import { db, auth as adminAuth } from "@/config/firebaseAdminConfig";
import { NextRequest } from "next/server";
import { POST } from "./route";

jest.mock("@/config/firebaseAdminConfig", () => ({
    db: {
        collection: jest.fn(),
    },
    auth: {
        verifyIdToken: jest.fn(),
    }
}));

describe("POST /api/profile/[uid]/unfollow", () => {
    const mockCollection = db.collection as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 401 if the user is unauthorised", async () => {
        const request = {
            headers: { get: jest.fn().mockReturnValue(null) },
            NextUrl: { pathname: "/api/profile/uid2/unfollow" }
        } as unknown as NextRequest;

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.message).toBe("Unauthorized");
    });

    it("sucessfully follows a user", async () => {
        (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: "uid1" });

        const mockUpdate = jest.fn().mockResolvedValue({});
        const mockDoc = jest.fn().mockReturnValue({ update: mockUpdate });
        mockCollection.mockReturnValue({ doc: mockDoc });

        const request = {
            headers: { get: jest.fn().mockReturnValue("Bearer valid-token") },
            nextUrl: { pathname: "/api/profile/uid2/unfollow" }
        } as unknown as NextRequest;

        const response = await POST(request);
        const body = await response.json();

        expect(adminAuth.verifyIdToken).toHaveBeenCalledWith("valid-token");
        expect(mockDoc).toHaveBeenCalledWith("uid2");
        expect(mockDoc).toHaveBeenCalledWith("uid1");
        expect(mockUpdate).toHaveBeenCalledTimes(2);
        expect(body.success).toBe(true);
    });

    it("handles errors gracefully", async () => {
        (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: "uid1" });

        const mockUpdate = jest.fn().mockRejectedValue(new Error("Fail"));
        const mockDoc = jest.fn().mockReturnValue({ update: mockUpdate });
        mockCollection.mockReturnValue({ doc: mockDoc });

        const request = {
            headers: { get: jest.fn().mockReturnValue("Bearer valid-token") },
            nextUrl: { pathname: "/api/profile/uid2/unfollow" }
        } as unknown as NextRequest;

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.message).toBe("Something went wrong");
    })
});
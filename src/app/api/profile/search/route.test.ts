import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";
import { GET } from "./route";
import { where } from "firebase/firestore";

jest.mock("@/config/firebaseAdminConfig", () => ({
    db: {
        collection: jest.fn(),
    },
}));

describe("GET api/users", () => {
    const mockCollection = db.collection as jest.Mock;

    it("returns 400 if query param is missing", async () => {
        const request = new NextRequest("https://localhost/api/users");
        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.message).toBe("Missing query");
    });

    it("returns matching users when a query succeeds", async () => {
        const mockDocs = [
            { id: "uid1", data: () => ({ username: "liam", email: "a@example.com" })},
            { id: "uid2", data: () => ({ username: "zayaan", email: "b@example.com" })},
        ];

        const mockGet = jest.fn().mockImplementation(() => {
            return {
                docs: mockDocs.filter((doc) =>
                doc.data().username.startsWith("li") // simulate Firestore prefix search
                ),
            };
        });
        const whereChain = {
            where: jest.fn().mockReturnThis(),
            get: mockGet,
        };

        mockCollection.mockReturnValue(whereChain);

        const request = new NextRequest("https://localhost/api/users?query=li");
        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.users).toEqual([
            { uid: "uid1", username: "liam", email: "a@example.com" },
        ]);

        expect(whereChain.where).toHaveBeenCalledWith("username", ">=", "li");
        expect(whereChain.where).toHaveBeenCalledWith("username", "<", "li\uf8ff");
    });

    it("handles errors gracefully", async () => {
        const mockGet = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const whereChain = {
            where: jest.fn().mockReturnThis(),
            get: mockGet,
        };

        mockCollection.mockReturnValue(whereChain);

        const request = new NextRequest("https://localhost/api/users?query=li");
        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.message).toBe("Internal server error");
    });

    it("handles non-Error thrown values", async () => {
        const mockGet = jest.fn().mockRejectedValue("random string");
        const whereChain = {
            where: jest.fn().mockReturnThis(),
            get: mockGet,
        };

        mockCollection.mockReturnValue(whereChain);

        const request = new NextRequest("https://localhost/api/users?query=li");
        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.message).toBe("Internal server error");
    });
});
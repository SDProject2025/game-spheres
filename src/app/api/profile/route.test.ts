import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";
import { GET} from "./route";

const mockWhere = jest.fn();
const mockSelect = jest.fn();
const mockCollection = jest.fn( () => ({select: mockSelect, doc: mockDoc}));

const mockGet = jest.fn();
const mockDoc = jest.fn( () => ({get: mockGet}));

jest.mock("@/config/firebaseAdminConfig", () => ({
    db: {
        collection: jest.fn( () => ({
            doc: mockDoc,
        })),
    },
}));

describe("GET /api/profile (Displaying profile info)", () => {
    it("Returns 400 if uid is missing", async () => {
        const request =  new NextRequest("http://localhost/api/profile");
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toBe("Missing uid");
    });

    it("Assigns user data accordingly and returns 200 on a sucessful match", async () => {
         mockGet.mockResolvedValueOnce({
            get: (field: string) => {
            const mockData: any = {
                username: "user",
                displayName: "Name",
                bio: "hi",
                followers: 0,
                following: 0,
                posts: [],
            };
            return mockData[field];
            },
        });
        
        const request = new NextRequest("https://localhost/api/profile?uid=1")
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.userData.username).toBe("user");
        expect(data.userData.displayName).toBe("Name");
        expect(data.userData.bio).toBe("hi");
        expect(data.userData.followers).toBe(0);
        expect(data.userData.following).toBe(0);
    });
})
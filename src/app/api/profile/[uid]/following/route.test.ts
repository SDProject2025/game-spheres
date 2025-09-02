import { NextRequest} from "next/server";
import { db } from "@/config/firebaseConfig";
import { doc, getDoc,collection, query, where, getDocs } from "firebase/firestore";
import { GET } from "./route";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleAuthProvider } from "firebase/auth/web-extension";
import { getStorage } from "firebase/storage";

jest.mock("firebase/firestore", () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
}));

jest.mock("@/config/firebaseConfig", () => ({
    getAuth: jest.fn(),
    getFirestore: jest.fn(),
    GoogleAuthProvider: jest.fn(),
    getStorage: jest.fn(),
}));

describe("GET /api/profile/[uid]/following", () => {
    const mockGetDoc = getDoc as jest.Mock;
    const mockGetDocs = getDocs as jest.Mock;
    const mockDoc = doc as jest.Mock;
    const mockCollection = collection as jest.Mock;
    const mockQuery = query as jest.Mock;
    const mockWhere = where as jest.Mock;

    it("returns an empty array if there is no uid", async () => {
        const request = new NextRequest("https://api/profile/undefined/following");
        const response = await GET(request, { params: Promise.resolve({ uid: "undefined" }) });
        const body = await response.json()

        expect(body.users).toEqual([]);
    });

    it("should return an empty array if the user is not following anyone", async () => {
        mockDoc.mockReturnValue("docRef");
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ following: [] }),
        });
        const request = new NextRequest("https://api/profile/uid1/following");
        const response = await GET(request, { params: Promise.resolve({ uid: "uid1" }) });
        const body = await response.json();

        expect(body.users).toEqual([]);
    });

    it("returns followers", async () => {
        mockDoc.mockReturnValue("docRef");
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ following: ["uid2", "uid3"] }),
        });
        

        mockCollection.mockReturnValue("colRef");
        mockQuery.mockReturnValue("queryRed");
        mockWhere.mockReturnValue("whereClause");
        mockGetDocs.mockResolvedValue({
            forEach: (cb: Function) => {
                cb({ id: "uid2", data: () => ({ username: "liam", displayName: "Liam" }) });
                cb({ id: "uid3", data: () => ({ username: "zainab", displayName: "Zainab" }) });
            },
        });

        const request = new NextRequest("https://api/profile/uid1/following");
        const response = await GET(request, { params: Promise.resolve({ uid: "uid1" }) });
        const body = await response.json();

        expect(body.users).toEqual([
            { id: "uid2", username: "liam", displayName: "Liam", avatar: "" },
            { id: "uid3", username: "zainab", displayName: "Zainab", avatar: "" },
        ])
    });
});
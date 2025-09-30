import { POST } from './route';
import { NextRequest } from 'next/server';

//Firestore Mock
const commitMock = jest.fn();
const updateMock = jest.fn();
const docMock = jest.fn(() => ({ doc: updateMock }));
const collectionMock = jest.fn(() => ({ doc: docMock }));
const batchMock = jest.fn(() => ({
    update: updateMock,
    commit: commitMock,
}));

//Firebase Admin Mock
jest.mock("@/config/firebaseAdminConfig", () => ({
  db: {
    batch: jest.fn(() => batchMock()),
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({})),
        })),
      })),
    })),
  },
}));

//Decode Token Mock
jest.mock("../../decodeToken", () => ({
    decodeToken: jest.fn(),
}));

describe("POST /notifications/update", () => {
    const { decodeToken } = require("../../decodeToken");
    const { db } = require("@/config/firebaseAdminConfig");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 if no uid", async () => {
        decodeToken.mockResolvedValue(null);

        const req = new NextRequest("http:localhost", {
            method: "POST",
            headers: { Authorization: "Bearer fake" },
            body: JSON.stringify([{ notificationId: "notif123" }]),
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.message).toBe("Unauthorized");
    });

    it("returns 401 if missing notifications", async () => {
        decodeToken.mockResolvedValue("user123");

        const req = new NextRequest("http:localhost", {
            method: "POST",
            headers: { Authorization: "Bearer valid" },
            body: JSON.stringify(null),
        });

        const res = await POST(req);
        const body = await res.json();
        
        expect(res.status).toBe(400);
        expect(body.message).toBe("Missing notifications");
    });

    it("updates notifications and commits batch", async () => {
        decodeToken.mockResolvedValue("user123");
        commitMock.mockResolvedValueOnce({});

        const req = new NextRequest("http:localhost", {
            method: "POST",
            headers: { Authorization: "Bearer valid" },
            body: JSON.stringify([{ notificationId: "notif123" }]),
        });

        const res = await POST(req);
        const body = await res.json();
        
        expect(res.status).toBe(200);
        expect(commitMock).toHaveBeenCalled();
    });

    it("handles non-Firestore errors gracefully", async () => {
        decodeToken.mockResolvedValue("user123");
        commitMock.mockRejectedValueOnce(new Error ("Not-Firestore exploded"));

        const req = new NextRequest("http:localhost", {
            method: "POST",
            headers: { Authorization: "Bearer valid" },
            body: JSON.stringify([{ notificationId: "notif123" }]),
        });

        const res = await POST(req);
        const body = await res.json();
        
        expect(res.status).toBe(500);
        expect(body.message).toBe("Not-Firestore exploded");
    });

    it("handles Firestore errors gracefully", async () => {
        decodeToken.mockResolvedValue("user123");
        commitMock.mockRejectedValueOnce("");

        const req = new NextRequest("http:localhost", {
            method: "POST",
            headers: { Authorization: "Bearer valid" },
            body: JSON.stringify([{ notificationId: "notif123" }]),
        });

        const res = await POST(req);
        const body = await res.json();
        
        expect(res.status).toBe(500);
        expect(body.message).toBe("Internal Server Error");
    });
})
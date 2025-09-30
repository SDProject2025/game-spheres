import { POST } from './route';
import { NextRequest } from 'next/server';
import { decodeToken } from '@/app/api/decodeToken';

describe("POST /chatupdate/read", () => {
    let POST: typeof import("./route").POST;

    let setMock: jest.Mock;
    let updateMock: jest.Mock;
    let commitMock: jest.Mock;
    let docMock: jest.Mock;
    let collectionMock: jest.Mock;
    let batchMock: jest.Mock;

    beforeEach(async () => {
        jest.resetModules();

        jest.mock("firebase-admin/firestore", () => ({
            FieldValue: { increment: jest.fn((n) => `increment(${n})`) },
        }));

        jest.mock("@/app/api/decodeToken", () => ({
            decodeToken: jest.fn(),
        }));

        updateMock = jest.fn();
        commitMock = jest.fn();

        const innerDocMock = jest.fn(() => ({
            update: updateMock,
        }));

        const innerCollectionMock = jest.fn(() => ({
            doc: innerDocMock,
        }));

        docMock = jest.fn(() => ({
            collection: innerCollectionMock,
            update: updateMock,
        }));

        collectionMock = jest.fn(() => ({
            doc: docMock,
        }));

        batchMock = jest.fn(() => ({
            update: updateMock,
            commit: commitMock,
        }));

        jest.doMock("@/config/firebaseAdminConfig", () => ({
            db: {
                collection: collectionMock,
                batch: batchMock,
            },
        }));

        POST = (await import("./route")).POST;
    });


    it("returns 401 if not authorized", async () => {
        const { decodeToken } = await import("@/app/api/decodeToken");
        (decodeToken as jest.Mock).mockResolvedValue(null);

        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: { Authorization: "Bearer fake" },
            body: JSON.stringify([{ conversationId: "conv1", messageId: "msg1", senderId: "user2" }]),
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.message).toBe("Unauthorized");
    });

    it("returns 400 is body is missing", async () => {
        const { decodeToken } = await import("@/app/api/decodeToken");
        (decodeToken as jest.Mock).mockResolvedValue("user123");

        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: { Authorization: "Bearer valid" },
            body: JSON.stringify(null),
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe("Missing messages");
    });

    it("successfully reads messages", async () => {
        const { decodeToken } = await import("@/app/api/decodeToken");
        (decodeToken as jest.Mock).mockResolvedValue("user123");

        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: { Authorization: "Bearer valid" },
            body: JSON.stringify([{ conversationId: "conv1", messageId: "msg1", senderId: "user2" }]),
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.status).toBe(200);

        expect(collectionMock).toHaveBeenCalledWith("conversations");
        expect(docMock).toHaveBeenCalledWith("conv1");
        expect(updateMock).toHaveBeenCalled();
        expect(commitMock).toHaveBeenCalled();
    });

    it("handles non-firestore errors gracefully", async () => {
        const { decodeToken } = await import("@/app/api/decodeToken");
        (decodeToken as jest.Mock).mockResolvedValue("user123");

        commitMock.mockRejectedValue(new Error("Simulated commit error"));

        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: { Authorization: "Bearer valid" },
            body: JSON.stringify([{ conversationId: "conv1", messageId: "msg1", senderId: "user2" }]),
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.message).toBe("Simulated commit error");
    });
});
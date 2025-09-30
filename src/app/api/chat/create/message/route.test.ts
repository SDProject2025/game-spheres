import { POST } from "./route";
import { NextRequest } from "next/server";
import { decodeToken } from "@/app/api/decodeToken";
import { db } from "@/config/firebaseAdminConfig";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

describe("POST /chat/create/message", () => {
    let POST: typeof import("./route").POST;
    let setMock: jest.Mock;
    let commitMock: jest.Mock;
    let getMock: jest.Mock;
    let docMock: jest.Mock;
    let collectionMock: jest.Mock;
    let batchMock: jest.Mock;
    let decodeTokenMock: jest.Mock;

    beforeEach(async () => {
        jest.resetModules();

        // Mocks for firebase-admin/firestore
        jest.doMock("firebase-admin/firestore", () => ({
            Timestamp: { now: jest.fn(() => "mockTimestamp") },
            FieldValue: { increment: jest.fn((n) => `increment(${n})`) },
        }));

        // Mock decodeToken
        decodeTokenMock = jest.fn();
        jest.doMock("@/app/api/decodeToken", () => ({
            decodeToken: decodeTokenMock,
        }));

        // Mocks for Firebase admin
        setMock = jest.fn();
        commitMock = jest.fn();
        getMock = jest.fn(() => ({
            exists: true,
            data: () => ({ participants: ["user1", "user2"] }),
        }));

        docMock = jest.fn(() => ({
            collection: jest.fn(() => ({
                doc: jest.fn(() => ({ set: setMock })),
            })),
            get: getMock,
            set: setMock,
        }));

        collectionMock = jest.fn(() => ({
            doc: docMock,
        }));

        batchMock = jest.fn(() => ({
            set: setMock,
            commit: commitMock,
        }));

        jest.doMock("@/config/firebaseAdminConfig", () => ({
            db: {
                collection: collectionMock,
                batch: batchMock,
            },
        }));

        // Import POST after mocks are defined
        POST = (await import("./route")).POST;
    });

    it("returns 401 if not authorized", async () => {
        decodeTokenMock.mockResolvedValue(null);

        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: { Authorization: "Bearer fake" },
            body: JSON.stringify({}),
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.message).toBe("Unauthorized");
    });

    it("returns 400 if post body missing", async () => {
        decodeTokenMock.mockResolvedValue("user123");

        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: { Authorization: "Bearer valid" },
            body: JSON.stringify(null),
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe("Missing post body");
    });

    it("successfully posts a message", async () => {
        decodeTokenMock.mockResolvedValue("user1");

        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: { Authorization: "Bearer valid" },
            body: JSON.stringify({
                conversationId: "conv1",
                content: "Hello World",
                senderId: "user1",
            }),
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);

        expect(collectionMock).toHaveBeenCalledWith("conversations");
        expect(docMock).toHaveBeenCalledWith("conv1");
        expect(batchMock).toHaveBeenCalled();
        expect(setMock).toHaveBeenCalled();
        expect(commitMock).toHaveBeenCalled();
    });

    it("handles non-firestore errors gracefully", async () => {
        decodeTokenMock.mockResolvedValue("user1");

        commitMock.mockRejectedValue(new Error("Simulated commit error"));

        const req = new NextRequest("http://localhost", {
            method: "POST",
            headers: { Authorization: "Bearer valid" },
            body: JSON.stringify({
                conversationId: "conv1",
                content: "Hello World",
                senderId: "user1",
            }),
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.message).toBe("Simulated commit error");
    });
});

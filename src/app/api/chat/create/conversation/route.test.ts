import { decodeToken } from '@/app/api/decodeToken';
import { POST } from './route';
import { NextRequest } from 'next/server';

//Firestore Mock
const commitMock = jest.fn();
const setMock = jest.fn();
const updateMock = jest.fn();
const getMock = jest.fn();
const whereMock = jest.fn(() => ({ get: getMock }));

//Firebase Admin Mock
jest.mock("@/config/firebaseAdminConfig", () => ({
  db: {
    batch: () => ({ set: setMock, update: updateMock, commit: commitMock }),
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({ id: "mockDocId", data: jest.fn() })),
      where: whereMock,
    })),
  },
}));

//Decode Token Mock
jest.mock("@/app/api/decodeToken", () => ({
    decodeToken: jest.fn(),
}));

describe("POST /chat/create/conversation", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 if unauthorized", async () => {
        (decodeToken as jest.Mock).mockResolvedValue(null);

        const req = new NextRequest("http://localhost", { method: "POST" });
        const res = await POST(req);
        const body = await res.json();
        
        expect(res.status).toBe(401);
        expect(body.message).toBe("Unauthorized");
    });

    it("returns 400 is post body missing", async () => {
        (decodeToken as jest.Mock).mockResolvedValue("user123");
        
        const req = new NextRequest("http://localhost", { method: "POST", body: JSON.stringify(null) });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toBe("Missing post body");
    });

    it("returns existing conversation if found", async () => {
        (decodeToken as jest.Mock).mockResolvedValue("user1");

        const fakeDoc = {
            id: "existingConvId",
            data: () => ({ participants: ["user1", "user2"] }),
        };
        getMock.mockResolvedValue({ docs: [fakeDoc] });

        const req = new NextRequest("http://localhost", {
            method: "POST",
            body: JSON.stringify({ participants: ["user1", "user2"] }),
        });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.conversationId).toBe("existingConvId");
    });

    it("creates a new conversation if none exists", async () => {
        (decodeToken as jest.Mock).mockResolvedValue("user1");

        //no existing conversations
        getMock.mockResolvedValue({ docs: [] });

        const req = new NextRequest("http://localhost", {
            method: "POST",
            body: JSON.stringify({ participants: ["user1", "user2"] }),
        });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(setMock).toHaveBeenCalled();
        expect(updateMock).toHaveBeenCalled();
        expect(commitMock).toHaveBeenCalled();
    });

    it("handles non-firestore errors gracefully", async () => {
        (decodeToken as jest.Mock).mockResolvedValue("user1");

        getMock.mockRejectedValue("");

        const req = new NextRequest("http://localhost", {
            method: "POST",
            body: JSON.stringify({ participants: ["user1", "user2"] }),
        });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.message).toBe("Failed to post conversation");
    });

    it("handles Firestore errors gracefully", async () => {
        (decodeToken as jest.Mock).mockResolvedValue("user1");

        getMock.mockRejectedValue(new Error("Firestore exploded"));

        const req = new NextRequest("http://localhost", {
            method: "POST",
            body: JSON.stringify({ participants: ["user1", "user2"] }),
        });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.message).toBe("Firestore exploded");
    });
});
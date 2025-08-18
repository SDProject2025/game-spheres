import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";
import { GET } from "./route";

describe("Auth Change", () => {
    let mockReq: NextRequest;
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns 400 if uid is missing", async () =>{
        mockReq = { nextUrl: { searchParams: new URLSearchParams() } } as unknown as NextRequest;
        const response = await GET(mockReq);
        const data = await response?.json();

        expect(response?.status).toBe(400);
        expect(data.message).toBe("Missing uid");
    })
});
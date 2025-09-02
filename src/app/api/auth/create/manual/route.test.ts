// src/app/api/auth/signUp/manual/route.test.ts

import { GET, POST } from "./route";
// pulling in the GET and POST handlers so we can test them
import { NextRequest, NextResponse } from "next/server";
// grabbing Next.js request/response types for typing the mocks

// fake firebase so we don’t hit real db
jest.mock("@/config/firebaseAdminConfig", () => {
  const mockGet = jest.fn(); // faking .get() to simulate fetching docs
  const mockSet = jest.fn(); // faking .set() to simulate writing docs
  const mockDoc = jest.fn(() => ({ set: mockSet })); // faking .doc() and giving it set

  const mockCollection = jest.fn(() => ({
    // faking .collection() with chained methods
    select: jest.fn(() => ({
      where: jest.fn(() => ({
        get: mockGet, // chain ends with .get()
      })),
    })),
    doc: mockDoc, // also support .doc().set()
  }));

  return { db: { collection: mockCollection } }; // return our fake db
});

import { db } from "@/config/firebaseAdminConfig";
// now we bring in our mocked db so we can poke at it

// grab the mock functions for easier access
const mockedCollection = (db.collection as jest.Mock)(); // call fake collection
const mockedWhereGet = mockedCollection.select().where().get; // grab .select().where().get
const mockedDocSet = mockedCollection.doc().set; // grab .doc().set

describe("SignUp Manual API", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // wipe mocks before each test so no leftover junk
  });

  describe("GET", () => {
    it("returns 200 if username is available", async () => {
      mockedWhereGet.mockResolvedValue({ empty: true }); // username not taken
      const mockReq: any = {
        nextUrl: { searchParams: new URLSearchParams({ username: "testuser" }) },
      }; // fake request with ?username=testuser
      const response = await GET(mockReq); // call GET handler
      const data = await response.json(); // parse json back
      expect(response.status).toBe(200); // status should be 200
      expect(data.message).toBe("Username available"); // msg says free
    });

    it("returns 409 if username is taken", async () => {
      mockedWhereGet.mockResolvedValue({ empty: false }); // username exists
      const mockReq: any = {
        nextUrl: { searchParams: new URLSearchParams({ username: "testuser" }) },
      }; // fake request again
      const response = await GET(mockReq); // call GET
      const data = await response.json(); // parse json
      expect(response.status).toBe(409); // should be conflict
      expect(data.message).toBe("Username taken"); // msg says taken
    });
  });

  describe("POST", () => {
    it("returns 400 if required fields are missing", async () => {
      const mockReq: any = { json: async () => ({ uid: "1", username: "user" }) }; // missing fields
      const response = await POST(mockReq); // call POST
      const data = await response.json(); // parse json
      expect(response.status).toBe(400); // should be bad request
      expect(data.message).toBe("Missing required fields"); // proper error msg
    });

    it("returns 409 if username is taken", async () => {
      mockedWhereGet.mockResolvedValue({ empty: false }); // username exists
      const mockReq: any = {
        json: async () => ({
          uid: "1",
          username: "user",
          displayName: "Name",
          email: "a@b.com",
        }),
      }; // fake request with all fields
      const response = await POST(mockReq); // call POST
      const data = await response.json(); // parse json
      expect(response.status).toBe(409); // conflict
      expect(data.message).toBe("Username is taken"); // proper msg
    });

    it("creates user and returns 200 if valid", async () => {
      mockedWhereGet.mockResolvedValue({ empty: true }); // username free
      mockedDocSet.mockResolvedValue(true); // simulate successful write
      const mockReq: any = {
        json: async () => ({
          uid: "1",
          username: "user",
          displayName: "Name",
          email: "a@b.com",
        }),
      }; // proper payload
      const response = await POST(mockReq); // call POST
      const data = await response.json(); // parse json
      expect(response.status).toBe(200); // status 200
      expect(data.message).toBe("User created successfully"); // success msg
      expect(mockedDocSet).toHaveBeenCalled(); // make sure set() ran
    });
  });
});


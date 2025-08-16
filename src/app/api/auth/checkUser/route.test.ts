// src/app/api/auth/checkUser/route.test.ts

declare module "@/config/firebaseAdminConfig" {
  export const __mockGet: jest.Mock;
}//declare module to get away from _mockGet error in jest.config.js

import { GET } from "./route";
import { NextRequest } from "next/server";

//mock the module inline, mock Firebase admin SDK functions so real database is not hit.
jest.mock("@/config/firebaseAdminConfig", () => {
  const mockGet = jest.fn();//mock function for get and returns a mock value snapshot
  const mockDoc = jest.fn(() => ({ get: mockGet }));//mock function for .doc(), returns an object with .get = mockGet
  const mockCollection = jest.fn(() => ({ doc: mockDoc }));//mock function for .collection(), returns an object with .doc = mockDoc
  
  //mock the db object to return the mockCollection function
  //this allows us to call db.collection().doc().get() in the tests
  //without hitting a real database
  return { db: { collection: mockCollection }, __mockGet: mockGet };
});
//now we acc import the mocked module
import { db, __mockGet } from "@/config/firebaseAdminConfig";
//begins a test suite named checkuser api
describe("CheckUser API", () => {
    //declare a variable for the mock request
    //this will be used in each test to simulate a request to the API
  let mockReq: NextRequest;

//before each test, clear the mock functions to ensure no state is carried over
//this basically ensures that theres no interference between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });
//test case which checks when user id is missing
  it("returns 400 if uid is missing", async () => {
    //as unknown as NextRequest forces typescript to accept the mockReq as a NextRequest type
    mockReq = { nextUrl: { searchParams: new URLSearchParams() } } as unknown as NextRequest;//mock req w empty params
    const response = await GET(mockReq);
    const data = await response.json();
//basically just check and make sure response status is missing uid
    expect(response.status).toBe(400);
    expect(data.message).toBe("Missing uid");
  });
//test case efor when a user is stored in the database
  it("returns 200 and exists=true if user exists", async () => {
    __mockGet.mockResolvedValue({ exists: true });
//create a mock request where the user id is 123
    mockReq = { nextUrl: { searchParams: new URLSearchParams({ uid: "123" }) } } as unknown as NextRequest;
    const response = await GET(mockReq);
    const data = await response.json();
//status should basically be successful and user does acc exist in the db
    expect(response.status).toBe(200);
    expect(data.exists).toBe(true);
  });
//test case for when a user does not exist in the database
  it("returns 200 and exists=false if user does not exist", async () => {
    __mockGet.mockResolvedValue({ exists: false });
//create a mock request where the user id is 456
    mockReq = { nextUrl: { searchParams: new URLSearchParams({ uid: "456" }) } } as unknown as NextRequest;
    const response = await GET(mockReq);
    const data = await response.json();
//status should be that user dne in the db
    expect(response.status).toBe(200);
    expect(data.exists).toBe(false);
  });
});

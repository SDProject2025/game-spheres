import { GET, POST } from "./route";
import { NextRequest } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
//similar stuff to manual signup, same type of test cases as well
const mockWhere = jest.fn();
const mockSelect = jest.fn(() => ({ where: mockWhere }));
const mockCollection = jest.fn(() => ({ select: mockSelect, doc: mockDoc }));

const mockGet = jest.fn();
const mockSet = jest.fn();
const mockDoc = jest.fn(() => ({ set: mockSet }));

jest.mock("@/config/firebaseAdminConfig", () => ({
  db: {
    collection: jest.fn(() => ({
      select: mockSelect,
      where: mockWhere,
      doc: mockDoc,
    })),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/users (username availability)", () => {
  it("returns 400 if username is missing", async () => {
    const request = new NextRequest("http://localhost/api/users");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Username is required");
  });

  it("returns candidate username if original is taken", async () => {
    mockWhere.mockReturnValueOnce({
      get: () => Promise.resolve({ empty: false }),
    });
    mockWhere.mockReturnValueOnce({
      get: () => Promise.resolve({ empty: true }),
    });

    const request = new NextRequest(
      "http://localhost/api/users?username=test"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.username).toBe("test0");
  });

  it("returns same username if available", async () => {
    mockWhere.mockReturnValueOnce({
      get: () => Promise.resolve({ empty: true }),
    });

    const request = new NextRequest(
      "http://localhost/api/users?username=unique"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.username).toBe("unique");
  });

it("returns 500 if Firestore errors", async () => {
  mockWhere.mockImplementationOnce(() => {
    throw new Error("Firestore error");
  });

  const request = new NextRequest(
    "http://localhost/api/users?username=test"
  );
  const response = await GET(request);
  const data = await response.json();

  expect(response.status).toBe(500);
  expect(data).toEqual({ message: {} });
});

});

describe("POST /api/users (user creation)", () => {
  const makeRequest = (body: any) =>
    new NextRequest("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify(body),
    });

  it("returns 400 if required fields are missing", async () => {
    const request = makeRequest({ username: "user" }); // missing uid, displayName, email
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Missing required fields");
  });

  it("returns 409 if username is already taken", async () => {
    mockWhere.mockReturnValueOnce({
      get: () => Promise.resolve({ empty: false }),
    });

    const request = makeRequest({
      uid: "123",
      username: "user",
      displayName: "User Name",
      email: "user@example.com",
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.message).toBe("Username is taken");
  });

  it("creates user successfully", async () => {
    mockWhere.mockReturnValueOnce({
      get: () => Promise.resolve({ empty: true }),
    });
    mockSet.mockResolvedValueOnce(undefined);

    const request = makeRequest({
      uid: "123",
      username: "newuser",
      displayName: "New User",
      email: "new@example.com",
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("User created successfully");
    expect(mockDoc).toHaveBeenCalledWith("123");
    expect(mockSet).toHaveBeenCalledWith({
      username: "newuser",
      displayName: "New User",
      email: "new@example.com",
      followers: [],
      following: [],
    });
  });

  it("returns 500 if Firestore set fails", async () => {
    mockWhere.mockReturnValueOnce({
      get: () => Promise.resolve({ empty: true }),
    });
    mockSet.mockRejectedValueOnce(new Error("DB write failed"));

    const request = makeRequest({
      uid: "123",
      username: "newuser",
      displayName: "New User",
      email: "new@example.com",
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("DB write failed");
  });
});

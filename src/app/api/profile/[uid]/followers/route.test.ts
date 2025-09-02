/**
 * @jest-environment node
 */
import { GET } from "./route";
import { NextResponse } from "next/server";
import { getDoc, getDocs } from "firebase/firestore";

// --- mocks ---
jest.mock("firebase/firestore", () => {
  return {
    doc: jest.fn(),
    getDoc: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
  };
});

jest.mock("@/config/firebaseConfig", () => ({
    getAuth: jest.fn(),
    getFirestore: jest.fn(),
    GoogleAuthProvider: jest.fn(),
    getStorage: jest.fn(),
}));

describe("GET /api/profile/[uid]/followers", () => {
  const mockParams = { uid: "uid1" };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns [] if uid is missing", async () => {
    const res = await GET(new Request("https://test/api/profile/uid/followers"), { params: Promise.resolve({ uid: "" }) });
    const body = await res.json();
    expect(body).toEqual({ users: [] });
  });

  it("returns [] if user does not exist", async () => {
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

    const res = await GET(new Request("https://test/api/profile/uid/followers"), { params: Promise.resolve(mockParams) });
    const body = await res.json();
    expect(body).toEqual({ users: [] });
  });

  it("returns [] if no followers", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ followers: [] }),
    });

    const res = await GET(new Request("https://test/api/profile/uid/followers"), { params: Promise.resolve(mockParams) });
    const body = await res.json();
    expect(body).toEqual({ users: [] });
  });

  it("returns followers if present", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ followers: ["uid2", "uid3"] }),
    });

    (getDocs as jest.Mock).mockResolvedValue({
      forEach: (cb: any) => {
        cb({
          id: "uid2",
          data: () => ({ username: "liam", displayName: "Liam", photoURL: "" }),
        });
        cb({
          id: "uid3",
          data: () => ({ username: "zainab", displayName: "Zainab", photoURL: "" }),
        });
      },
    });

    const res = await GET(new Request("https://test/api/profile/uid/followers"), { params: Promise.resolve(mockParams) });
    const body = await res.json();

    expect(body).toEqual({
      users: [
        { id: "uid2", username: "liam", displayName: "Liam", avatar: "" },
        { id: "uid3", username: "zainab", displayName: "Zainab", avatar: "" },
      ],
    });
  });
});

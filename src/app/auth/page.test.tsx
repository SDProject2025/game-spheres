/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Auth from "@/app/auth/page";
import { withProvider, authFetch } from "@/config/authorisation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  validatePassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { googleProvider, auth } from "@/config/firebaseConfig";

// Mock router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock custom helpers
jest.mock("@/config/authorisation", () => ({
  withProvider: jest.fn(),
  authFetch: jest.fn(),
}));

// Mock firebase/auth
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  validatePassword: jest.fn(),
  getAuth: jest.fn(() => ({})),
}));

//Mock firebaseConfig
jest.mock("@/config/firebaseConfig", () => ({
    googleProvider: jest.fn(),
    storage: jest.fn(),
    auth: { app: "mock-app", currentUser: null },
}));

describe("Auth Component", () => {
  const mockReplace = jest.fn();

  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        })),
    });
  });


  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
    }) as jest.Mock;
    jest.clearAllMocks();
  });

  it("renders sign-in form by default", () => {
    render(<Auth />);
    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
  });

  it("switches to sign-up form when link is clicked", () => {
    render(<Auth />);
    fireEvent.click(screen.getByText(/Don't have an account\?/i));
    expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
  });

  it("calls signInWithProvider successfully", async () => {
    (withProvider as jest.Mock).mockResolvedValue({
      user: { uid: "123", displayName: "Test User", email: "test@test.com" },
    });
    (authFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ username: "TestUser" }),
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ exists: false }),
    });

    render(<Auth />);
    const googleButton = screen.getByRole("button", { name: "SIGN IN WITH GOOGLE Google icon" });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(withProvider).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("calls manual sign-in", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: { uid: "123" },
    });

    render(<Auth />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });

    const signInButton = screen.getByRole("button", { name: "SIGN IN" });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        "test@test.com",
        "password"
      );
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

//   it("calls manual sign-up", async () => {
//     (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
//       user: { uid: "123" },
//     });
//     (authFetch as jest.Mock).mockResolvedValue({ ok: true });
//     (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);

//     global.fetch = jest.fn().mockResolvedValue({
//       ok: true,
//       json: async () => ({ exists: false }),
//     });

//     render(<Auth />);
//     fireEvent.mouseDown(screen.getByText(/Don't have an account\?/i));

//     const emailInput = screen.getByLabelText(/email/i);
//     const usernameInput = screen.getByLabelText(/username/i);
//     const displayNameInput = screen.getByLabelText(/display name/i);
//     const passwordInput = screen.getByLabelText(/password/i);

//     fireEvent.change(emailInput, { target: { value: "new@test.com" } });
//     fireEvent.change(usernameInput, { target: { value: "newuser" } });
//     fireEvent.change(displayNameInput, { target: { value: "New User" } });
//     fireEvent.change(passwordInput, { target: { value: "secret" } });
    
//     const signUpButton = screen.getByRole("button", { name: "SIGN UP" });
//     fireEvent.click(signUpButton);

//     await waitFor(() => {
//       expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
//         auth,
//         "new@test.com",
//         "secret"
//       );
//       expect(sendEmailVerification).toHaveBeenCalled();
//       expect(mockReplace).toHaveBeenCalledWith("/");
//     });
//   });
});

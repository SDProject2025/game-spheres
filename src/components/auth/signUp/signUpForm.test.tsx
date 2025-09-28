/** 
* @jest-environment jsdom
*/

import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpForm from "./signUpForm";

describe("SignUpForm", () => {
    it("renders correctly with all necessary fields and buttons", () => {
        render(
            <SignUpForm
                handleSignUpClick={jest.fn()}
                validatePassword={jest.fn()}
                validateUsername={jest.fn()}
                signInWithGoogle={jest.fn()}
            />
        );

        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getAllByRole("button")[0]).toBeInTheDocument();
    });

    it("adds invalid styling when username, password or email are invalid", async () => {
        const mockValidatePassword = jest.fn(async () => false);
        const mockValidateUsername = jest.fn(async () => false);

        render(
            <SignUpForm
                handleSignUpClick={jest.fn()}
                validatePassword={mockValidatePassword}
                validateUsername={mockValidateUsername}
                signInWithGoogle={jest.fn()}
            />
        );

        const usernameInput = screen.getByLabelText(/username/i);
        await userEvent.type(usernameInput, "takenUsername");

        await waitFor(() => expect(mockValidateUsername).toHaveBeenCalled());

        expect(usernameInput.className).toContain("border-red-500");

        const passwordInput = screen.getByLabelText(/password/i);
        await userEvent.type(passwordInput, "123");

        await waitFor(() => expect(mockValidatePassword).toHaveBeenCalled());

        expect(passwordInput.className).toContain("border-red-500");

        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, "invalid@example");

        expect(emailInput.className).toContain("border-red-500");
    });

    it("calls handleSignUpClick when all validations pass", async () => {
        const mockHandleSignUpClick = jest.fn();
        const mockValidatePassword = jest.fn(async () => true);
        const mockValidateUsername = jest.fn(async () => true);

        render(
            <SignUpForm
                handleSignUpClick={mockHandleSignUpClick}
                validatePassword={mockValidatePassword}
                validateUsername={mockValidateUsername}
                signInWithGoogle={jest.fn()}
            />
        );

        await userEvent.type(screen.getByLabelText(/username/i), "newUser");
        await userEvent.type(screen.getByLabelText(/display name/i), "Display");
        await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
        await userEvent.type(screen.getByLabelText(/password/i), "StrongPassword1");

        fireEvent.click(screen.getByRole("button", { name: /^SIGN UP$/i }));

        await waitFor(() =>
            expect(mockHandleSignUpClick).toHaveBeenLastCalledWith(
                "newUser",
                "Display",
                "test@example.com",
                "StrongPassword1"
            )
        );
    });
});

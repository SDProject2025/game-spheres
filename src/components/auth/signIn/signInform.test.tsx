/** 
* @jest-environment jsdom
*/

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignInForm from "./signInForm";

describe("SignInForm", () => {
    it("renders correctly", () => {
        render(<SignInForm signInWithGoogle={jest.fn()} handleSignInClick={jest.fn()} />);

        // Heading
        expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();

        // Inputs
        expect(screen.getByLabelText(/email:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

        // Buttons
        expect(screen.getAllByRole("button", { name: /sign in/i })[0]).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
    });

    it("calls handleSignInClick with email and password on form submit", async () => {
        const mockHandleSignInClick = jest.fn();
        render(<SignInForm signInWithGoogle={jest.fn()} handleSignInClick={mockHandleSignInClick} />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(passwordInput, "password");

        fireEvent.click(screen.getAllByRole("button", { name: /sign in/i})[0]);

        expect(mockHandleSignInClick).toHaveBeenCalledWith("test@example.com", "password");
    });

    it("calls signInWithGoogle when Google button is clicked", async () => {
        const mockSignInWithGoogle = jest.fn();
        render(<SignInForm signInWithGoogle={mockSignInWithGoogle} handleSignInClick={jest.fn()} />);

        const googleButton = screen.getByRole("button", { name: /sign in with google/i });
        await userEvent.click(googleButton);

        expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    });
});
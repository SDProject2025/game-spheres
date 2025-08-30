/** 
* @jest-environment jsdom
*/

import { screen, render, fireEvent } from "@testing-library/react";
import PasswordInput from "./passwordInput";

describe("PasswordInput", () =>{
    it("renders with label, icon and view button", () =>{
        render(<PasswordInput label="Password" id="password"/>);

        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByTestId("lock-icon")).toBeInTheDocument();
        expect(screen.getByRole("button")). toBeInTheDocument();
        expect(screen.getByTestId("hide-icon")).toBeInTheDocument();
    });

    it("switches between show and hide when the button is clicked", () => {
        render(<PasswordInput label="Password" id="password" />);
        const showHideButton = screen.getByRole("button");

        expect(screen.getByTestId("hide-icon")).toBeInTheDocument();

        fireEvent.click(showHideButton);

        expect(screen.getByTestId("show-icon")).toBeInTheDocument();
    });
});
/** 
* @jest-environment jsdom
*/

import { render, screen, fireEvent } from "@testing-library/react";
import TextInput from "./textInput";
import { MdEmail } from "react-icons/md";

describe("TextInput", () => {
    it("renders with label", () => {
        render(<TextInput label="Email" id="email" />);

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it("renders with icon", () =>{
        render(<TextInput label="Email" id="email" icon={<MdEmail />} />);

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("calls onChange when typing", () => {
        const handleChange = jest.fn();
        render(<TextInput label="Email" id="email" onChange={handleChange} />);

        const input = screen.getByLabelText(/email/i);
        fireEvent.change(input, { target: { value: "test@example.com" } });

        expect(handleChange).toHaveBeenCalled();
        expect((input as HTMLInputElement).value).toBe("test@example.com");
    });

    it("accepts additional props", () => {
        render(<TextInput label="Password" id="password" type="password" />);
        const input = screen.getByLabelText(/password/i);
        expect(input).toHaveAttribute("type", "password");
    });
});
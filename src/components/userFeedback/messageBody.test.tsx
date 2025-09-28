/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import MessageBody from "./messageBody";

describe("MessageBody", () => {
  it("renders the textarea with placeholder text", () => {
    render(<MessageBody value="" onChange={() => {}} />);

    //im basically verifying that the textarea is present with the correct placeholder
    const textarea = screen.getByPlaceholderText(/enter your message/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(""); //its initially empty
  });

  it("displays the provided value in the textarea", () => {
    render(<MessageBody value="Hello world" onChange={() => {}} />);

    const textarea = screen.getByPlaceholderText(/enter your message/i);
    expect(textarea).toHaveValue("Hello world");
  });

  it("calls onChange with the new value when user types", () => {
    const handleChange = jest.fn();
    render(<MessageBody value="" onChange={handleChange} />);

    const textarea = screen.getByPlaceholderText(/enter your message/i);

    //simulate typing into the textarea
    fireEvent.change(textarea, { target: { value: "Test message" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("Test message");
  });

  it("updates the textarea when value prop changes", () => {
    const { rerender } = render(
      <MessageBody value="Initial text" onChange={() => {}} />
    );

    const textarea = screen.getByPlaceholderText(/enter your message/i);
    expect(textarea).toHaveValue("Initial text");

    //simulate updating the value prop
    rerender(<MessageBody value="Updated text" onChange={() => {}} />);
    expect(textarea).toHaveValue("Updated text");
  });
});
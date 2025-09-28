/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import CommentInput from "./CommentInput";

describe("CommentInput", () => {
  it("renders the input and send button", () => {
    render(<CommentInput onAdd={() => {}} />);

    expect(screen.getByPlaceholderText(/add a comment/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("updates the input value when user types", () => {
    render(<CommentInput onAdd={() => {}} />);
    const input = screen.getByPlaceholderText(/add a comment/i) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "New comment" } });
    expect(input.value).toBe("New comment");
  });

  it("calls onAdd with the input value when send button is clicked", () => {
    const handleAdd = jest.fn();
    render(<CommentInput onAdd={handleAdd} />);

    const input = screen.getByPlaceholderText(/add a comment/i);
    const button = screen.getByRole("button", { name: /send/i });

    // Type into the input
    fireEvent.change(input, { target: { value: "This is a comment" } });
    fireEvent.click(button);

    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd).toHaveBeenCalledWith("This is a comment");
  });

  it("clears the input after submitting", () => {
    const handleAdd = jest.fn();
    render(<CommentInput onAdd={handleAdd} />);

    const input = screen.getByPlaceholderText(/add a comment/i) as HTMLInputElement;
    const button = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "Clear me" } });
    fireEvent.click(button);

    expect(input.value).toBe(""); // Should clear after submit
  });

  it("still calls onAdd even if input is empty", () => {
    const handleAdd = jest.fn();
    render(<CommentInput onAdd={handleAdd} />);

    const button = screen.getByRole("button", { name: /send/i });
    fireEvent.click(button);

    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd).toHaveBeenCalledWith(""); // Empty string
  });
});

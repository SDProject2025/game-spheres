/** 
* @jest-environment jsdom
*/
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ChatInput from "./chatInput";

describe("ChatInput Component", () => {
  let onSendMessageMock: jest.Mock;

  beforeEach(() => {
    onSendMessageMock = jest.fn();
  });

  test("renders input and send button", () => {
    render(<ChatInput onSendMessage={onSendMessageMock} />);

    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  test("send button should be disabled when input is empty", () => {
    render(<ChatInput onSendMessage={onSendMessageMock} />);
    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeDisabled();
  });

  test("send button should be enabled when input has text", () => {
    render(<ChatInput onSendMessage={onSendMessageMock} />);
    const input = screen.getByPlaceholderText(/type a message/i);
    const button = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "Hello" } });
    expect(button).not.toBeDisabled();
  });

  test("calls onSendMessage with input value when form is submitted", () => {
    render(<ChatInput onSendMessage={onSendMessageMock} />);
    const input = screen.getByPlaceholderText(/type a message/i);
    const form = screen.getByTestId("chat-form");

    fireEvent.change(input, { target: { value: "Hello World" } });
    fireEvent.submit(form);

    expect(onSendMessageMock).toHaveBeenCalledTimes(1);
    expect(onSendMessageMock).toHaveBeenCalledWith("Hello World");
  });

  test("clears input after sending a message", () => {
    render(<ChatInput onSendMessage={onSendMessageMock} />);
    const input = screen.getByPlaceholderText(/type a message/i);
    const form = screen.getByTestId("chat-form");

    fireEvent.change(input, { target: { value: "Clear me" } });
    fireEvent.submit(form);

    expect(input).toHaveValue("");
  });

  test("does not call onSendMessage when input is empty", () => {
    render(<ChatInput onSendMessage={onSendMessageMock} />);
    const form = screen.getByTestId("chat-form");

    fireEvent.submit(form);

    expect(onSendMessageMock).not.toHaveBeenCalled();
  });
});


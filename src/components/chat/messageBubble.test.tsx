/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import MessageBubble from "./messageBubble";
import type { MessageInput } from "@/types/Message";
import { CgCheckO } from "react-icons/cg";

describe("MessageBubble", () => {
  const baseMessage: MessageInput = {
    messageId: "msg1",
    content: "Hello world!",
    conversationId: "conv1",
    senderId: "user1",
    createdAt: new Date().toISOString(),
    read: true,
  };

  it("renders message content", () => {
    render(<MessageBubble msg={baseMessage} isSent={true} />);
    expect(screen.getByText("Hello world!")).toBeInTheDocument();
  });

  it("renders sent message styling", () => {
    render(<MessageBubble msg={baseMessage} isSent={true} />);
    const bubble = screen.getByText("Hello world!").closest("div");
    expect(bubble).toHaveClass("bg-green-700 text-white");
  });

  it("renders received message styling", () => {
    render(<MessageBubble msg={baseMessage} isSent={false} />);
    const bubble = screen.getByText("Hello world!").closest("div");
    expect(bubble).toHaveClass("bg-gray-600 text-white");
  });

  it("renders check icon for sent messages", () => {
    render(<MessageBubble msg={baseMessage} isSent={true} />);
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("does not render check icon for received messages", () => {
    render(<MessageBubble msg={baseMessage} isSent={false} />);
    expect(screen.queryByTestId("check-icon")).toBeNull();
  });

  it("renders read check icon in green if message is read", () => {
    render(<MessageBubble msg={{ ...baseMessage, read: true }} isSent={true} />);
    const icon = screen.getByTestId("check-icon");
    expect(icon).toHaveClass("text-green-400");
  });

  it("renders unread check icon in gray if message is not read", () => {
    render(<MessageBubble msg={{ ...baseMessage, read: false }} isSent={true} />);
    const icon = screen.getByTestId("check-icon");
    expect(icon).toHaveClass("text-gray-400");
  });

  it("renders 'Today' format for today's messages", () => {
    const todayMessage = {
      ...baseMessage,
      createdAt: new Date().toISOString(),
    };

    render(<MessageBubble msg={todayMessage} isSent={true} />);
    const dateText = screen.getByTestId("message-date").textContent;

    expect(dateText).toMatch(/^Today, \d{1,2}:\d{2}/);
  });

  it("renders 'Yesterday' format for yesterday's messages", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayMessage = {
      ...baseMessage,
      createdAt: yesterday.toISOString(),
    };

    render(<MessageBubble msg={yesterdayMessage} isSent={true} />);
    const dateText = screen.getByTestId("message-date").textContent;

    expect(dateText).toMatch(/^Yesterday, \d{1,2}:\d{2}/);
  });

  it("renders full date format for older messages", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 5);

    const oldMessage = {
      ...baseMessage,
      createdAt: oldDate.toISOString(),
    };

    render(<MessageBubble msg={oldMessage} isSent={true} />);
    const dateText = screen.getByTestId("message-date").textContent;

    const expectedDate = new Intl.DateTimeFormat([], {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(oldDate);

    expect(dateText).toBe(expectedDate);
  });
});

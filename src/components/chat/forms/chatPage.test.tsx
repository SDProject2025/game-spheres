/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ChatPage from "./chatPage";
import type { MessageInput } from "@/types/Message";
import type { Profile } from "@/types/Profile";
import Link from "next/link";

// ==================== MOCKS ==================== //
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

// Mock child components so we can track props and avoid complex rendering
jest.mock("../messageBubble", () => (props: any) => (
  <div data-testid="message-bubble">
    {props.msg.content} - {props.isSent ? "sent" : "received"}
  </div>
));

jest.mock("../chatInput", () => (props: any) => (
  <div>
    <button data-testid="mock-send-btn" onClick={() => props.onSendMessage("Hello")}>
      Mock Send
    </button>
  </div>
));

// Mock next/link so it just renders its children
jest.mock("next/link", () => {
  return ({ href, children }: any) => (
    <a href={href} data-testid="mock-link">
      {children}
    </a>
  );
});

// ==================== TEST DATA ==================== //

const mockMessages: MessageInput[] = [
  {
    messageId: "1",
    conversationId: "c1",
    senderId: "current-user",
    content: "Hello",
    createdAt: new Date().toISOString(),
    read: true,
  },
  {
    messageId: "2",
    conversationId: "c1",
    senderId: "other-user",
    content: "Hi there!",
    createdAt: new Date().toISOString(),
    read: false,
  },
];
const mockOtherUser: Profile = {
  uid: "other-user",
  username: "TestUser",
  displayName: "Test Display Name",
  bio: "This is a test bio",
  following: [],
  followers: [],
  photoURL: "https://example.com/photo.jpg",
};


// ==================== TESTS ==================== //

describe("ChatPage Component", () => {
  const mockOnSendMessage = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders header with username and profile link", () => {
    render(
      <ChatPage
        messages={[]}
        onSendMessage={mockOnSendMessage}
        otherUser={mockOtherUser}
      />
    );

    const username = screen.getByText("TestUser");
    expect(username).toBeInTheDocument();

    const link = screen.getByTestId("mock-link");
    expect(link).toHaveAttribute("href", `/profile/${mockOtherUser.uid}`);
  });

  test("renders back button and calls onBack when clicked", () => {
    render(
      <ChatPage
        messages={[]}
        onSendMessage={mockOnSendMessage}
        otherUser={mockOtherUser}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByTestId("back-button");
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);

  });

  test("renders messages with correct sent/received status", () => {
    render(
      <ChatPage
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        otherUser={mockOtherUser}
      />
    );

    const bubbles = screen.getAllByTestId("message-bubble");

    // First message is from current user -> "sent"
    expect(bubbles[0]).toHaveTextContent("Hello - sent");

    // Second message is from other user -> "received"
    expect(bubbles[1]).toHaveTextContent("Hi there! - received");
  });

  test("renders ChatInput and calls onSendMessage when send is clicked", () => {
    render(
      <ChatPage
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        otherUser={mockOtherUser}
      />
    );

    const sendButton = screen.getByTestId("mock-send-btn");
    fireEvent.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledTimes(1);
    expect(mockOnSendMessage).toHaveBeenCalledWith("Hello");
  });

  test("scrolls to bottom when messages change", () => {
    const scrollIntoViewMock = jest.fn();

    // Mock ref behavior
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    const { rerender } = render(
      <ChatPage
        messages={[]}
        onSendMessage={mockOnSendMessage}
        otherUser={mockOtherUser}
      />
    );

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1); // initial render

    // Add new message
    rerender(
      <ChatPage
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        otherUser={mockOtherUser}
      />
    );

    // It should scroll to bottom again when messages update
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(2);
  });

  test("renders empty state correctly when there are no messages", () => {
    render(
      <ChatPage
        messages={[]}
        onSendMessage={mockOnSendMessage}
        otherUser={mockOtherUser}
      />
    );

    // Chat area should exist but have no message bubbles
    const bubbles = screen.queryAllByTestId("message-bubble");
    expect(bubbles.length).toBe(0);
  });
});

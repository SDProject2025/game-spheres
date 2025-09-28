/** 
* @jest-environment jsdom
*/
import React from "react";
import { render, screen } from "@testing-library/react";
import ConversationItem from "./conversationItem";
import type { ConversationInput } from "@/types/Conversation";

describe("ConversationItem Component", () => {
  const baseConv: ConversationInput = {
    //id: "1",//id not used ion comp so unnecessary
    participants: ["user1", "user2"],
    updatedAt: "2025-09-28T10:30:00Z",
    lastMessage: "Hello there!",
  };

  const usernames = {
    user1: "Alice",
    user2: "Bob",
  };

  const userId = "user1"; // current user

  test("renders participants excluding current user", () => {
    render(<ConversationItem conv={baseConv} userId={userId} usernames={usernames} />);
    expect(screen.getByText(/Conversation with: Bob/i)).toBeInTheDocument();
  });

  test("renders formatted updatedAt date when present", () => {
    render(<ConversationItem conv={baseConv} userId={userId} usernames={usernames} />);
    const dateElement = screen.getByText(/\w{3} \d{2}, \d{2}:\d{2}/); // matches 'Sep 28, 10:30'
    expect(dateElement).toBeInTheDocument();
  });

  test("displays 'No messages yet.' when lastMessage is missing", () => {
    const convNoMsg = { ...baseConv, lastMessage: "" };
    render(<ConversationItem conv={convNoMsg} userId={userId} usernames={usernames} />);
    expect(screen.getByText(/No messages yet./i)).toBeInTheDocument();
  });

  test("displays lastMessage when present", () => {
    render(<ConversationItem conv={baseConv} userId={userId} usernames={usernames} />);
    expect(screen.getByText(/Hello there!/i)).toBeInTheDocument();
  });

  test("falls back to user ID if username not found", () => {
    const convUnknownUser = { ...baseConv, participants: ["user1", "user3"] };
    render(<ConversationItem conv={convUnknownUser} userId={userId} usernames={usernames} />);
    expect(screen.getByText(/Conversation with: user3/i)).toBeInTheDocument();
  });

  test("renders empty date if updatedAt is missing", () => {
    const convNoDate = { ...baseConv, updatedAt: "" };
    render(<ConversationItem conv={convNoDate} userId={userId} usernames={usernames} />);
    // Ensure no date text is shown
    const dateElements = screen.queryByText(/\w{3} \d{2}, \d{2}:\d{2}/);
    expect(dateElements).not.toBeInTheDocument();
  });
});

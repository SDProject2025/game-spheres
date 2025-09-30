/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import ConversationItem from "./conversationItem";
import type { ConversationInput } from "@/types/Conversation";

describe("ConversationItem", () => {
  const mockUserId = "user1";
  const mockUsernames = {
    user2: "Alice",
    user3: "Bob",
  };

  const baseConv: ConversationInput = {
    participants: ["user1", "user2", "user3"],
    updatedAt: new Date("2025-09-30T10:30:00Z").toISOString(),
    lastMessage: "Hello world!",
  };

  it("renders participant names excluding the current user", () => {
    render(
      <ConversationItem
        conv={baseConv}
        userId={mockUserId}
        usernames={mockUsernames}
      />
    );

    expect(
      screen.getByText(/Conversation with: Alice, Bob/i)
    ).toBeInTheDocument();
  });

  it("renders formatted updatedAt date", () => {
    render(
      <ConversationItem
        conv={baseConv}
        userId={mockUserId}
        usernames={mockUsernames}
      />
    );

    const expectedDate = new Intl.DateTimeFormat([], {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(baseConv.updatedAt))

    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it("renders lastMessage", () => {
    render(
      <ConversationItem
        conv={baseConv}
        userId={mockUserId}
        usernames={mockUsernames}
      />
    );

    expect(screen.getByText("Hello world!")).toBeInTheDocument();
  });

  it("shows 'No messages yet.' if lastMessage is empty", () => {
    const convWithoutMessage = { ...baseConv, lastMessage: "" };

    render(
      <ConversationItem
        conv={convWithoutMessage}
        userId={mockUserId}
        usernames={mockUsernames}
      />
    );

    expect(screen.getByText("No messages yet.")).toBeInTheDocument();
  });

  it("handles missing usernames gracefully", () => {
    const convWithUnknownUser = {
      ...baseConv,
      participants: ["user1", "unknownUser"],
    };

    render(
      <ConversationItem
        conv={convWithUnknownUser}
        userId={mockUserId}
        usernames={mockUsernames}
      />
    );

    expect(
      screen.getByText(/Conversation with: unknownUser/i)
    ).toBeInTheDocument();
  });
});

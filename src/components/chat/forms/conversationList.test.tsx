/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import ConversationList from "./conversationList";
import type { ConversationInput } from "@/types/Conversation";

jest.mock("../conversationItem", () => (props: any) => (
  <div data-testid="conversation-item">
    {props.conv.conversationId} - {props.userId}
  </div>
));

jest.mock("next/link", () => {
  return ({ children, ...props }: any) => (
    <a {...props} data-testid="mock-link">
      {children}
    </a>
  );
});

const mockConversations: ConversationInput[] = [
  {
    conversationId: "conv1",
    participants: ["user1", "user2"],
    unreadCounts: { user1: 2, user2: 0 },
    lastMessage: "Hello from user2",
    updatedAt: new Date().toISOString(),
  },
  {
    conversationId: "conv2",
    participants: ["user1", "user3"],
    unreadCounts: { user1: 0, user3: 1 },
    lastMessage: "Hey user1",
    updatedAt: new Date().toISOString(),
  },
];

const mockUsernames = {
  user1: "Alice",
  user2: "Bob",
  user3: "Charlie",
};

const currentUserId = "user1";

describe("ConversationList Component", () => {
  test("renders a list of conversations", () => {
    render(
      <ConversationList
        conversations={mockConversations}
        userId={currentUserId}
        usernames={mockUsernames}
      />
    );

    const items = screen.getAllByTestId("conversation-item");
    expect(items).toHaveLength(2);

    expect(items[0]).toHaveTextContent("conv1");
    expect(items[1]).toHaveTextContent("conv2");
  });

  test("each conversation item links to the correct chat page", () => {
    render(
      <ConversationList
        conversations={mockConversations}
        userId={currentUserId}
        usernames={mockUsernames}
      />
    );

    const links = screen.getAllByTestId("mock-link");
    expect(links[0]).toHaveAttribute("href", "/chat/conv1");
    expect(links[1]).toHaveAttribute("href", "/chat/conv2");
  });

  test("applies green background for conversations with unread messages for current user", () => {
    render(
      <ConversationList
        conversations={mockConversations}
        userId={currentUserId}
        usernames={mockUsernames}
      />
    );

    const links = screen.getAllByTestId("mock-link");

    // conv1 has unread messages for user1 -> green background
    expect(links[0].className).toContain("bg-green-800");

    // conv2 has no unread messages for user1 -> gray background
    expect(links[1].className).toContain("bg-gray-800");
  });

  test("passes correct props to ConversationItem", () => {
    render(
      <ConversationList
        conversations={mockConversations}
        userId={currentUserId}
        usernames={mockUsernames}
      />
    );

    const firstItem = screen.getAllByTestId("conversation-item")[0];
    expect(firstItem).toHaveTextContent("conv1 - user1");
  });

  test("renders empty list gracefully when there are no conversations", () => {
    render(
      <ConversationList
        conversations={[]}
        userId={currentUserId}
        usernames={mockUsernames}
      />
    );

    // ul should still be present
    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();

    // but no list items
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});

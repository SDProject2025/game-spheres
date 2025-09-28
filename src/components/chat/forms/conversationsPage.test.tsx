/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConversationsPageForm from "./conversationsPage";
import type { Profile } from "@/types/Profile";
import type { ConversationInput } from "@/types/Conversation";
//import type { User } from "@/components/profile/forms/followList";

jest.mock("./conversationList", () => (props: any) => (
  <div data-testid="conversation-list">
    {props.conversations.length} Conversations
  </div>
));


jest.mock("@/components/profile/forms/followList", () => (props: any) => (
  <div data-testid="follow-list">
    <p>FollowList Type: {props.type}</p>
    <button data-testid="mock-message-btn" onClick={() => props.renderButton({ uid: "u123", username: "NewUser" }).props.onClick()}>
      Trigger Message
    </button>
    <button data-testid="mock-close-btn" onClick={props.onClose}>
      Close
    </button>
  </div>
));

const mockProfile: Profile = {
  uid: "user1",
  username: "Alice",
  displayName: "Alice Wonderland",
  bio: "Just a test user",
  following: ["user2"],
  followers: ["user3"],
  photoURL: "https://example.com/photo.jpg",
};

const mockConversations: ConversationInput[] = [
  {
    conversationId: "conv1",
    participants: ["user1", "user2"],
    unreadCounts: { user1: 2, user2: 0 },
    lastMessage: "Hello!",
    updatedAt: new Date().toISOString(),
  },
];

const mockUsernames = {
  user1: "Alice",
  user2: "Bob",
  user3: "Charlie",
};

describe("ConversationsPageForm Component", () => {
  const mockSetOpenType = jest.fn();
  const mockFetchFollowData = jest.fn().mockResolvedValue([]);
  const mockCreateChat = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders header and New Chat button", () => {
    render(
      <ConversationsPageForm
        userId="user1"
        profile={mockProfile}
        conversations={mockConversations}
        usernames={mockUsernames}
        openType={null}
        setOpenType={mockSetOpenType}
        fetchFollowData={mockFetchFollowData}
        createChat={mockCreateChat}
      />
    );

    expect(screen.getByText("Active Conversations")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /New Chat/i })).toBeInTheDocument();
  });

  test("shows message when there are no conversations", () => {
    render(
      <ConversationsPageForm
        userId="user1"
        profile={mockProfile}
        conversations={[]}
        usernames={mockUsernames}
        openType={null}
        setOpenType={mockSetOpenType}
        fetchFollowData={mockFetchFollowData}
        createChat={mockCreateChat}
      />
    );

    expect(screen.getByText("No conversations yet.")).toBeInTheDocument();
  });

  test("renders ConversationList with conversations", () => {
    render(
      <ConversationsPageForm
        userId="user1"
        profile={mockProfile}
        conversations={mockConversations}
        usernames={mockUsernames}
        openType={null}
        setOpenType={mockSetOpenType}
        fetchFollowData={mockFetchFollowData}
        createChat={mockCreateChat}
      />
    );

    const conversationList = screen.getByTestId("conversation-list");
    expect(conversationList).toHaveTextContent("1 Conversations");
  });

  test("clicking New Chat button calls setOpenType with 'following'", () => {
    render(
      <ConversationsPageForm
        userId="user1"
        profile={mockProfile}
        conversations={mockConversations}
        usernames={mockUsernames}
        openType={null}
        setOpenType={mockSetOpenType}
        fetchFollowData={mockFetchFollowData}
        createChat={mockCreateChat}
      />
    );

    const newChatButton = screen.getByRole("button", { name: /New Chat/i });
    fireEvent.click(newChatButton);

    expect(mockSetOpenType).toHaveBeenCalledWith("following");
  });

  test("renders FollowList when openType is set", () => {
    render(
      <ConversationsPageForm
        userId="user1"
        profile={mockProfile}
        conversations={mockConversations}
        usernames={mockUsernames}
        openType="following"
        setOpenType={mockSetOpenType}
        fetchFollowData={mockFetchFollowData}
        createChat={mockCreateChat}
      />
    );

    expect(screen.getByTestId("follow-list")).toBeInTheDocument();
    expect(screen.getByText(/FollowList Type: following/)).toBeInTheDocument();
  });

  test("clicking close button calls setOpenType with null", () => {
    render(
      <ConversationsPageForm
        userId="user1"
        profile={mockProfile}
        conversations={mockConversations}
        usernames={mockUsernames}
        openType="following"
        setOpenType={mockSetOpenType}
        fetchFollowData={mockFetchFollowData}
        createChat={mockCreateChat}
      />
    );

    const closeButton = screen.getByTestId("mock-close-btn");
    fireEvent.click(closeButton);

    expect(mockSetOpenType).toHaveBeenCalledWith(null);
  });

  test("clicking message button inside FollowList triggers createChat", () => {
    render(
      <ConversationsPageForm
        userId="user1"
        profile={mockProfile}
        conversations={mockConversations}
        usernames={mockUsernames}
        openType="following"
        setOpenType={mockSetOpenType}
        fetchFollowData={mockFetchFollowData}
        createChat={mockCreateChat}
      />
    );

    const messageButton = screen.getByTestId("mock-message-btn");
    fireEvent.click(messageButton);

    expect(mockCreateChat).toHaveBeenCalledWith({ uid: "u123", username: "NewUser" });
  });
});

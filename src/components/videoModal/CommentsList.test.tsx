/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentsList from "./CommentsList";
import type { Comment } from "@/types/Comment";

describe("CommentsList", () => {
  const now = new Date();

  const createComment = (
    secondsAgo: number,
    overrides: Partial<Comment> = {}
  ): Comment => ({
    id: `comment-${secondsAgo}`,
    text: "Sample comment",
    displayName: "John Doe",
    photoURL: "",
    userId: "user-123",
    createdAt: new Date(now.getTime() - secondsAgo * 1000),
    ...overrides,
  });

  const renderWithTime = (secondsAgo: number, onDelete = () => {}) => {
    render(
      <CommentsList
        comments={[createComment(secondsAgo)]}
        userId="user-123"
        uploaderId="uploader-456"
        onDelete={onDelete}
      />
    );
  };

  it("displays 'just now' for comments less than 60 seconds old", () => {
    renderWithTime(30); // 30 seconds ago
    expect(screen.getByText(/just now/i)).toBeInTheDocument();
  });

  it("displays 'minutes ago' for comments less than 1 hour old", () => {
    renderWithTime(300); // 5 minutes ago
    expect(screen.getByText(/5 minutes ago/i)).toBeInTheDocument();
  });

  it("displays 'hours ago' for comments less than 24 hours old", () => {
    renderWithTime(7200); // 2 hours ago
    expect(screen.getByText(/2 hours ago/i)).toBeInTheDocument();
  });

  it("displays 'days ago' for comments less than 7 days old", () => {
    renderWithTime(172800); // 2 days ago
    expect(screen.getByText(/2 days ago/i)).toBeInTheDocument();
  });

  it("displays 'weeks ago' for comments less than 30 days old", () => {
    renderWithTime(1209600); // 2 weeks ago
    expect(screen.getByText(/2 weeks ago/i)).toBeInTheDocument();
  });

  it("displays 'months ago' for comments less than a year old", () => {
    renderWithTime(5184000); // 2 months ago
    expect(screen.getByText(/2 months ago/i)).toBeInTheDocument();
  });

  it("displays 'years ago' for comments older than a year", () => {
    renderWithTime(63072000); // 2 years ago
    expect(screen.getByText(/2 years ago/i)).toBeInTheDocument();
  });

  it("calls onDelete with correct args when comment owner clicks Delete", async () => {
    const onDelete = jest.fn();

    render(
      <CommentsList
        comments={[createComment(300, { id: "c1", userId: "owner-123" })]}
        userId="owner-123" // current user is owner
        uploaderId="uploader-456"
        onDelete={onDelete}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("c1", "owner-123");
  });

  it("calls onDelete when uploader clicks Delete on someone else's comment", async () => {
    const onDelete = jest.fn();

    render(
      <CommentsList
        comments={[createComment(300, { id: "c2", userId: "someone-else" })]}
        userId="uploader-456" // current user is uploader
        uploaderId="uploader-456"
        onDelete={onDelete}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("c2", "someone-else");
  });

  it("does not show Delete button for unrelated users", () => {
    render(
      <CommentsList
        comments={[createComment(300, { id: "c3", userId: "another-user" })]}
        userId="random-user"
        uploaderId="uploader-456"
        onDelete={() => {}}
      />
    );

    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("renders empty state message when there are no comments", () => {
    render(
      <CommentsList comments={[]} userId="user-123" uploaderId="uploader-456" onDelete={() => {}} />
    );

    expect(
      screen.getByText(/No comments yet\. Be the first!/i)
    ).toBeInTheDocument();
  });
});

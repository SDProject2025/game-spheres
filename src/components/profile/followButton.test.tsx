/** 
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import FollowButton from "./followButton";

describe("FollowButton", () => {
  it("renders Follow button when isFollowing=false", () => {
    render(
      <FollowButton
        isFollowing={false}
        handleFollowClick={jest.fn()}
        handleUnfollowClick={jest.fn()}
      />
    );

    // just checking that the follow button actually shows up when it should
    expect(screen.getByRole("button", { name: /follow/i })).toBeInTheDocument();
    // and that it says "follow" on it
    expect(screen.getByText(/follow/i)).toBeInTheDocument();
  });

  it("renders Unfollow button when isFollowing=true", () => {
    render(
      <FollowButton
        isFollowing={true}
        handleFollowClick={jest.fn()}
        handleUnfollowClick={jest.fn()}
      />
    );

    // making sure it switches to unfollow mode when isFollowing is true
    expect(
      screen.getByRole("button", { name: /unfollow/i })
    ).toBeInTheDocument();
    // and the text changes to "unfollow"
    expect(screen.getByText(/unfollow/i)).toBeInTheDocument();
  });

  it("calls handleFollowClick when Follow button is clicked", () => {
    // mock function to track if it gets called
    const mockFollow = jest.fn();
    render(
      <FollowButton
        isFollowing={false}
        handleFollowClick={mockFollow}
        handleUnfollowClick={jest.fn()}
      />
    );

    // simulate clicking the follow button
    fireEvent.click(screen.getByRole("button", { name: /follow/i }));
    // check that our mock function was called exactly once
    expect(mockFollow).toHaveBeenCalledTimes(1);
  });

  it("calls handleUnfollowClick when Unfollow button is clicked", () => {
    // another mock function for unfollow
    const mockUnfollow = jest.fn();
    render(
      <FollowButton
        isFollowing={true}
        handleFollowClick={jest.fn()}
        handleUnfollowClick={mockUnfollow}
      />
    );

    // click the unfollow button this time
    fireEvent.click(screen.getByRole("button", { name: /unfollow/i }));
    // make sure the unfollow handler gets called
    expect(mockUnfollow).toHaveBeenCalledTimes(1);
  });

  it("applies styling classes correctly", () => {
    render(
      <FollowButton
        isFollowing={false}
        handleFollowClick={jest.fn()}
        handleUnfollowClick={jest.fn()}
      />
    );

    // grab the button and check if it has the right CSS classes
    const button = screen.getByRole("button", { name: /follow/i });
    // checking for rounded corners
    expect(button).toHaveClass("rounded-md");
    // and that sweet teal background color
    expect(button).toHaveClass("bg-[#00ffc3]");
  });
});
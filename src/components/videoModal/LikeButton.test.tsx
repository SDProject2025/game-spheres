/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import LikeButton from "./LikeButton";

describe("LikeButton", () => {
  it("renders the button with like count and unfilled heart by default", () => {
    const { container } = render(
      <LikeButton
        isLiked={false}
        likesCount={5}
        onClick={() => {}}
        disabled={false}
      />
    );

    const button = screen.getByRole("button");
    const likeCount = screen.getByText("5");

    const heartIcon = container.querySelector("svg");

    expect(button).toBeInTheDocument();
    expect(likeCount).toBeInTheDocument();
    expect(heartIcon).toBeInTheDocument();

    expect(heartIcon).not.toHaveClass("fill-[#00ffd5]");
  });

  it("renders a filled heart when isLiked is true", () => {
    const { container } = render(
      <LikeButton
        isLiked={true}
        likesCount={10}
        onClick={() => {}}
        disabled={false}
      />
    );

    const heartIcon = container.querySelector("svg");
    expect(heartIcon).toBeInTheDocument();

    expect(heartIcon).toHaveClass("fill-[#00ffd5]");
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("calls onClick when button is clicked", () => {
    const mockOnClick = jest.fn();
    render(
      <LikeButton
        isLiked={false}
        likesCount={2}
        onClick={mockOnClick}
        disabled={false}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when button is disabled", () => {
    const mockOnClick = jest.fn();
    render(
      <LikeButton
        isLiked={false}
        likesCount={2}
        onClick={mockOnClick}
        disabled={true}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("applies disabled styles when disabled is true", () => {
    render(
      <LikeButton
        isLiked={false}
        likesCount={3}
        onClick={() => {}}
        disabled={true}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("opacity-50");
    expect(button).toHaveClass("cursor-not-allowed");
  });

  it("applies hover style when enabled", () => {
    render(
      <LikeButton
        isLiked={false}
        likesCount={3}
        onClick={() => {}}
        disabled={false}
      />
    );

    const button = screen.getByRole("button");

    expect(button).not.toHaveClass("opacity-50");
    expect(button).toHaveClass("hover:text-[#00ffd5]");
  });

  it("updates like count and heart fill dynamically when props change", () => {
    const { container, rerender } = render(
      <LikeButton
        isLiked={false}
        likesCount={1}
        onClick={() => {}}
        disabled={false}
      />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    let heartIcon = container.querySelector("svg");
    expect(heartIcon).not.toHaveClass("fill-[#00ffd5]");

    rerender(
      <LikeButton
        isLiked={true}
        likesCount={2}
        onClick={() => {}}
        disabled={false}
      />
    );

    expect(screen.getByText("2")).toBeInTheDocument();
    heartIcon = container.querySelector("svg");
    expect(heartIcon).toHaveClass("fill-[#00ffd5]");
  });
});

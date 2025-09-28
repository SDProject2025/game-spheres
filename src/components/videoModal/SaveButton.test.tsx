/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import SaveButton from "./SaveButton";

describe("SaveButton", () => {
  it("renders BookmarkCheck icon when saved is true", () => {
    const mockOnClick = jest.fn();
    const { container } = render(<SaveButton saved={true} onClick={mockOnClick} />);

    const icon = container.querySelector("svg");

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("cursor-pointer");
    expect(icon).toHaveClass("text-[#00ffd5]");
  });

  it("renders Bookmark icon when saved is false", () => {
    const mockOnClick = jest.fn();
    const { container } = render(<SaveButton saved={false} onClick={mockOnClick} />);

    const icon = container.querySelector("svg");

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("cursor-pointer");
    expect(icon).toHaveClass("text-[#00ffd5]");
  });

  it("calls onClick with 'unsave' when clicking the BookmarkCheck icon", () => {
    const mockOnClick = jest.fn();
    const { container } = render(<SaveButton saved={true} onClick={mockOnClick} />);

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();

    fireEvent.click(icon!);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith("unsave");
  });

  it("calls onClick with 'save' when clicking the Bookmark icon", () => {
    const mockOnClick = jest.fn();
    const { container } = render(<SaveButton saved={false} onClick={mockOnClick} />);

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();

    fireEvent.click(icon!);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith("save");
  });

  it("switches between Bookmark and BookmarkCheck when saved prop changes", () => {
    const mockOnClick = jest.fn();
    const { container, rerender } = render(<SaveButton saved={false} onClick={mockOnClick} />);

    let icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();

    rerender(<SaveButton saved={true} onClick={mockOnClick} />);
    icon = container.querySelector("svg");

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("cursor-pointer");
    expect(icon).toHaveClass("text-[#00ffd5]");
  });
});

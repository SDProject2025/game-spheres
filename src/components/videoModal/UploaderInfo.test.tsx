/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import UploaderInfo from "./UploaderInfo";

describe("UploaderInfo Component", () => {
  const mockDate = new Date("2025-09-28T10:00:00Z");

  const uploader = {
    displayName: "ebra hoo",
    username: "ebraa",
    photoURL: "http://example.com/avatar.jpg",
  };

  it("renders the uploader's display name and formatted date", () => {
    render(<UploaderInfo uploader={uploader} uploadedAt={mockDate} />);

    expect(screen.getByText("ebra hoo")).toBeInTheDocument();

    expect(
      screen.getByText(`Uploaded At: ${mockDate.toLocaleDateString()}`)
    ).toBeInTheDocument();
  });

  it("renders uploader's profile picture when photoURL is provided", () => {
    render(<UploaderInfo uploader={uploader} uploadedAt={mockDate} />);

    const image = screen.getByRole("img");

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "http://example.com/avatar.jpg");
    expect(image).toHaveAttribute("alt", "ebra hoo");
  });

  it("does not render image if photoURL is missing", () => {
    const uploaderWithoutPhoto = {
      ...uploader,
      photoURL: "",
    };

    render(<UploaderInfo uploader={uploaderWithoutPhoto} uploadedAt={mockDate} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("uses username as fallback alt text when displayName is missing", () => {
    const uploaderWithNoDisplayName = {
      displayName: "",
      username: "ebraa",
      photoURL: "http://example.com/avatar.jpg",
    };

    render(<UploaderInfo uploader={uploaderWithNoDisplayName} uploadedAt={mockDate} />);

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("alt", "ebraa");
  });

  it('uses "User" as fallback alt text when displayName and username are missing', () => {
    const uploaderWithNoNames = {
      displayName: "",
      username: "",
      photoURL: "http://example.com/avatar.jpg",
    };

    render(<UploaderInfo uploader={uploaderWithNoNames} uploadedAt={mockDate} />);

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("alt", "User");
  });

  it("renders correctly when uploader is null", () => {
    render(<UploaderInfo uploader={null} uploadedAt={mockDate} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText("ebra hoo")).not.toBeInTheDocument();

    expect(
      screen.getByText(`Uploaded At: ${mockDate.toLocaleDateString()}`)
    ).toBeInTheDocument();
  });
});

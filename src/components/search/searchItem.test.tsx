/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import SearchItemContainer from "./searchItem";

describe("SearchItemContainer", () => {
  const mockProps = {
    imageUrl: "https://example.com/image.jpg",
    searchTitle: "Example Title",
  };

  it("renders the image with correct src and alt text", () => {
    render(<SearchItemContainer {...mockProps} />);
    //find the image by its role and alt text
    const img = screen.getByRole("img", { name: mockProps.searchTitle });
    //check that the image is in the document
    expect(img).toBeInTheDocument();
    //verify the image source is correct
    expect(img).toHaveAttribute("src", mockProps.imageUrl);
    //verify the alt text matches the search title
    expect(img).toHaveAttribute("alt", mockProps.searchTitle);
  });

  it("renders the search title text", () => {
    render(<SearchItemContainer {...mockProps} />);
    //check that the search title text appears in the component
    expect(screen.getByText(mockProps.searchTitle)).toBeInTheDocument();
  });
});
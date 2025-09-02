/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import SearchDetails from "./searchDetails";

//test suite for the SearchDetails component
describe("SearchDetails", () => {
  //mock props object that will be used across multiple tests
  const mockProps = {
    imageUrl: "https://example.com/image.jpg",
    searchTitle: "Test Title",
  };

  //test that the component renders an image with correct attributes
  it("renders the image with correct src and alt", () => {
    //render the component with mock props
    render(<SearchDetails {...mockProps} />);
    //find the image element by its alt text and cast to HTMLImageElement for better type checking
    const img = screen.getByAltText(mockProps.searchTitle) as HTMLImageElement;
    //verify the image element exists in the document
    expect(img).toBeInTheDocument();
    //verify the image src attribute matches exactly with our mock url
    expect(img.src).toBe(mockProps.imageUrl);
  });

  //test that the title renders correctly with proper semantic markup
  it("renders the title correctly", () => {
    render(<SearchDetails {...mockProps} />);
    //find the title element by its text content
    const title = screen.getByText(mockProps.searchTitle);
    //verify the title element exists
    expect(title).toBeInTheDocument();
    //verify the title is rendered as an H2 element for proper semantic structure
    expect(title.tagName).toBe("H2");
  });

  //test that the component properly renders children content when provided
  it("renders children if provided", () => {
    render(
      <SearchDetails {...mockProps}>
        {/*add a test child element with data-testid for easy querying*/}
        <p data-testid="child">Child content</p>
      </SearchDetails>
    );
    //find the child element by its test id
    const child = screen.getByTestId("child");
    //verify the child element exists in the document
    expect(child).toBeInTheDocument();
    //verify the child element has the correct text content
    expect(child.textContent).toBe("Child content");
  });

  //test that the component works correctly when no children are provided
  it("renders correctly without children", () => {
    render(<SearchDetails {...mockProps} />);
    //try to query for the child element that shouldn't exist
    const child = screen.queryByTestId("child");
    //verify that no child element with that test id was found (returns null)
    expect(child).toBeNull();
  });
});

/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import SearchDetails from "./searchDetails";

//test suite for the SearchDetails component
describe("SearchDetails", () => {
  //mock props that we'll use across multiple tests ofc
  const mockProps = {
    imageUrl: "test-image.jpg",
    searchTitle: "Test Title",
    children: <p>Child content</p>,
  };

  //test that the component renders an image with correct src and alt attributes
  it("renders the image with correct src and alt", () => {
    //render the component with our mock props
    render(<SearchDetails {...mockProps} />);
    //find the image by its alt text (which should be the searchTitle)
    const img = screen.getByAltText(mockProps.searchTitle) as HTMLImageElement;

    //check that the image is actually in the document
    expect(img).toBeInTheDocument();
    //verify the image src contains our test image URL
    expect(img.src).toContain(mockProps.imageUrl);
  });

  //test that the component displays the search title text
  it("renders the search title", () => {
    //render with mock props
    render(<SearchDetails {...mockProps} />);
    //check that the search title text appears in the document
    expect(screen.getByText(mockProps.searchTitle)).toBeInTheDocument();
  });

  //test that the component renders any children passed to it
  it("renders children when provided", () => {
    //render with mock props that include children
    render(<SearchDetails {...mockProps} />);
    //check that the child content appears in the document
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  //test that the component works correctly when no children are provided
  it("renders correctly without children", () => {
    //render without passing any children
    render(
      <SearchDetails imageUrl={mockProps.imageUrl} searchTitle={mockProps.searchTitle} />
    );
    //verify that the child content from our mock props is NOT found
    expect(screen.queryByText("Child content")).toBeNull();
  });
});

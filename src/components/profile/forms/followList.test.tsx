/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FollowList from "./followList";

//mock next/link component to simplify testing by rendering a regular anchor tag
jest.mock("next/link", () => {
  return ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  );
});

//mock next/image component to render a regular img tag for easier testing
jest.mock("next/image", () => {
  return (props: any) => <img {...props} />;
});

//test suite for the FollowList component
describe("FollowList", () => {
  //create mock functions for the component's callback props
  const mockOnClose = jest.fn();
  const mockFetchData = jest.fn();

  //default props to use across multiple tests
  const defaultProps = {
    type: "followers" as const, //specify it's a const to maintain type safety
    count: 2, //number of followers/following
    isOpen: true, //modal is open by default
    onClose: mockOnClose, //close handler function
    onFetchData: mockFetchData, //data fetching function
  };

  //reset all mocks before each test to ensure clean state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //test that the component doesn't render when isOpen is false
  it("does not render when isOpen is false", () => {
    render(<FollowList {...defaultProps} isOpen={false} />);
    //verify that the component content is not in the document
    expect(screen.queryByText(/Followers/)).not.toBeInTheDocument();
  });

  //test the loading state when data is being fetched
  it("renders loading state", async () => {
    //mock fetchData to return a promise that never resolves (simulates loading)
    mockFetchData.mockReturnValue(new Promise(() => {}));
    render(<FollowList {...defaultProps} />);
    //wait for and verify the loading text appears
    expect(await screen.findByText("Loading...")).toBeInTheDocument();
  });

  //test the error state when data fetching fails
  it("renders error state when fetch fails", async () => {
    //mock fetchData to reject with an error
    mockFetchData.mockRejectedValue(new Error("Network error"));
    render(<FollowList {...defaultProps} />);
    //wait for and verify the error message appears
    expect(await screen.findByText("Failed to load users")).toBeInTheDocument();
  });

  //test the empty state when no users are returned
  it("renders empty state when no users", async () => {
    //mock fetchData to resolve with empty array
    mockFetchData.mockResolvedValue([]);
    render(<FollowList {...defaultProps} />);
    //wait for and verify the empty state message appears
    expect(await screen.findByText("No followers yet")).toBeInTheDocument();
  });

  //test that the component correctly renders a list of users
  it("renders list of users", async () => {
    //mock fetchData to resolve with sample user data
    mockFetchData.mockResolvedValue([
      { id: "1", username: "john", displayName: "John Doe", avatar: "avatar1.jpg" },
      { id: "2", username: "jane", displayName: "Jane Smith" }, //intentionally no avatar to test fallback
    ]);

    render(<FollowList {...defaultProps} />);

    //wait for and verify user data is displayed
    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("@john")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("@jane")).toBeInTheDocument();

    //verify avatar fallback is shown for user without avatar
    expect(screen.getByText("👤")).toBeInTheDocument();
  });

  //test that the close button triggers the onClose callback
  it("calls onClose when close button is clicked", async () => {
    mockFetchData.mockResolvedValue([]);
    render(<FollowList {...defaultProps} />);
    //find the close button (using × character which is typically used for close buttons)
    const closeBtn = await screen.findByText("×");
    //simulate clicking the close button
    fireEvent.click(closeBtn);
    //verify the onClose mock function was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  //test that clicking a user link also triggers the onClose callback
  it("calls onClose when a user link is clicked", async () => {
    mockFetchData.mockResolvedValue([
      { id: "1", username: "john", displayName: "John Doe" },
    ]);
    render(<FollowList {...defaultProps} />);

    //find the user link by display name
    const userLink = await screen.findByText("John Doe");
    //simulate clicking the user link
    fireEvent.click(userLink);
    //verify the onClose mock function was called
    expect(mockOnClose).toHaveBeenCalled();
  });
});

/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchBar, { SearchItem } from "./searchBar";

//test suite for the SearchBar component
describe("SearchBar", () => {
  //define a test-specific interface that extends the base SearchItem
  interface TestItem extends SearchItem {
    id: string;
    name: string;
  }

  //mock data array for testing search results
  const mockItems: TestItem[] = [
    { id: "1", name: "Item 1" },
    { id: "2", name: "Item 2" },
  ];

  //mock search function that filters items based on query
  const searchFunction = jest.fn(async (query: string) => {
    return mockItems.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  });

  //mock function to render individual search result items
  const renderItem = jest.fn((item: TestItem, isSelected: boolean) => (
    <div>{item.name}</div>
  ));

  //mock function to render detailed view of selected item
  const renderDetails = jest.fn((item: TestItem) => (
    <div>Details of {item.name}</div>
  ));

  //mock callback for item actions
  const onItemAction = jest.fn();
  //mock function to generate dynamic button text based on item
  const actionButtonText = jest.fn((item: TestItem) => `Action ${item.name}`);

  //beforeEach runs before each test to reset mocks
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //test that the search input and title render correctly
  it("renders search input and title", () => {
    render(
      <SearchBar
        placeholder="Search..."
        title="Test Search"
        searchFunction={searchFunction}
        renderItem={renderItem}
        renderDetails={renderDetails}
      />
    );

    //verify the search input with placeholder text is present
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    //verify the title text is displayed
    expect(screen.getByText("Test Search")).toBeInTheDocument();
  });

  //test that search results appear and first item is auto-selected
  it("renders results and auto-selects first item", async () => {
    render(
      <SearchBar
        placeholder="Search..."
        title="Test Search"
        searchFunction={searchFunction}
        renderItem={renderItem}
        renderDetails={renderDetails}
        onSelectionChange={jest.fn()}
      />
    );

    //get the search input element
    const input = screen.getByPlaceholderText("Search...");
    //simulate user typing "Item" into search
    fireEvent.change(input, { target: { value: "Item" } });

    //wait for debounce and async search to complete
    await waitFor(() => {
      //verify search function was called with correct query
      expect(searchFunction).toHaveBeenCalledWith("Item");
    });

    //verify both mock items are rendered in results
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();

    //verify details pane shows first item by default (auto-selection)
    expect(screen.getByText("Details of Item 1")).toBeInTheDocument();
  });

  //test that users can select different items from results
  it("allows selecting another item", async () => {
    render(
      <SearchBar
        placeholder="Search..."
        title="Test Search"
        searchFunction={searchFunction}
        renderItem={renderItem}
        renderDetails={renderDetails}
      />
    );

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Item" } });

    //wait for search results to appear
    await waitFor(() => {
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });

    //simulate clicking on the second item
    fireEvent.click(screen.getByText("Item 2"));

    //verify details update to show second item's information
    expect(screen.getByText("Details of Item 2")).toBeInTheDocument();
  });

  //test that action button renders and works correctly
  it("renders action button and triggers callback", async () => {
    render(
      <SearchBar
        placeholder="Search..."
        title="Test Search"
        searchFunction={searchFunction}
        renderItem={renderItem}
        renderDetails={renderDetails}
        onItemAction={onItemAction}
        actionButtonText={actionButtonText}
      />
    );

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Item" } });

    //wait for action button to appear with correct text
    await waitFor(() => {
      expect(screen.getByText("Action Item 1")).toBeInTheDocument();
    });

    //simulate clicking the action button
    fireEvent.click(screen.getByText("Action Item 1"));
    //verify callback was called with correct item data
    expect(onItemAction).toHaveBeenCalledWith(mockItems[0]);
  });

  //test empty search results handling
  it("displays 'No results found' when search yields nothing", async () => {
    render(
      <SearchBar
        placeholder="Search..."
        title="Test Search"
        searchFunction={jest.fn(async () => [])}
        renderItem={renderItem}
        renderDetails={renderDetails}
      />
    );

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Nothing" } });

    //wait for empty results message to appear
    await waitFor(() => {
      expect(screen.getByText("No results found.")).toBeInTheDocument();
    });
  });

  //test default placeholder when no item is selected
  it("shows default placeholder when no item is selected", async () => {
    render(
      <SearchBar
        placeholder="Search..."
        title="Test Search"
        searchFunction={jest.fn(async () => [])}
        renderItem={renderItem}
        renderDetails={renderDetails}
      />
    );

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Nothing" } });

    //wait for default placeholder text to appear
    await waitFor(() => {
      expect(
        screen.getByText("Search and select an item to see details here.")
      ).toBeInTheDocument();
    });
  });
});
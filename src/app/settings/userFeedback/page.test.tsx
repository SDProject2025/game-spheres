/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SettingsPage from "./page";
import { toast } from "react-hot-toast";

jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    promise: jest.fn((promise) => promise),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

const mockRefreshGameSpheres = jest.fn();
jest.mock("@/config/gameSpheresContext", () => ({
  useGameSpheresContext: () => ({
    refreshGameSpheres: mockRefreshGameSpheres,
  }),
}));

jest.mock("@/components/userFeedback/messageBody", () => (props: any) => (
  <input
    data-testid="message-body"
    value={props.value}
    onChange={(e) => props.onChange(e.target.value)}
  />
));

jest.mock("@/components/neonButton", () => (props: any) => (
  <button {...props}>{props.children}</button>
));

beforeAll(() => {
  global.fetch = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe("SettingsPage", () => {
  it("renders correctly with sections and buttons", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Cache Management")).toBeInTheDocument();
    expect(screen.getByText("Clear Cache")).toBeInTheDocument();
    expect(screen.getByText("We'd love your feedback!")).toBeInTheDocument();
    expect(screen.getByTestId("message-body")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("clears cache and refreshes game spheres successfully", async () => {
    render(<SettingsPage />);
    const clearButton = screen.getByText("Clear Cache");

    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(localStorage.getItem("gameSpheresCache")).toBeNull();
      expect(mockRefreshGameSpheres).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith("Cache cleared and refreshed!");
    });
  });

  it("shows error toast if refreshGameSpheres fails", async () => {
    mockRefreshGameSpheres.mockRejectedValueOnce(new Error("Failed to refresh"));

    render(<SettingsPage />);
    const clearButton = screen.getByText("Clear Cache");

    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to refresh GameSpheres");
    });
  });

  it("submits feedback when message is provided", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<SettingsPage />);
    const input = screen.getByTestId("message-body");
    const submitButton = screen.getByText("Submit");

    fireEvent.change(input, { target: { value: "This is feedback" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/settings/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "This is feedback" }),
      });
      expect(toast.promise).toHaveBeenCalled();
    });
  });

  it("does not submit feedback if message is empty", async () => {
    render(<SettingsPage />);
    const submitButton = screen.getByText("Submit");

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
      expect(toast.promise).not.toHaveBeenCalled();
    });
  });
});

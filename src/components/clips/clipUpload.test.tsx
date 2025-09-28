/**
 * @jest-environment jsdom
 */
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import ClipUpload from "./clipUpload";

class MockXHR {
  upload = { addEventListener: jest.fn() };
  open = jest.fn();
  setRequestHeader = jest.fn();

  status: number = 0;
  onload?: () => void;
  uploadProgressHandler?: (event: any) => void;

  send = jest.fn(() => {
    if (this.uploadProgressHandler) {
      this.uploadProgressHandler({ lengthComputable: true, loaded: 50, total: 100 });
    }

    setTimeout(() => {
      if (this.onload) {
        this.status = 200;
        this.onload();
      }
    }, 0);
  });

  addEventListener = jest.fn((event: string, handler: any) => {
    if (event === "load") {
      this.onload = handler;
    }
    if (event === "progress") {
      this.uploadProgressHandler = handler;
    }
  });
}

(global as any).XMLHttpRequest = MockXHR;

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ uploadId: "123", uploadUrl: "/upload-url" }),
    ok: true,
  })
) as jest.Mock;
jest.mock("firebase/storage", () => ({
  ref: jest.fn(),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
}));

jest.mock("@/config/gameSpheresContext", () => ({
  useGameSpheresContext: jest.fn(() => ({
    gameSpheres: [
      { id: "1", name: "League of Legends" },
      { id: "2", name: "Valorant" },
    ],
  })),
}));

jest.mock("@/config/userProvider", () => ({
  useUser: jest.fn(() => ({
    user: { uid: "user123" },
  })),
}));

describe("ClipUpload Component", () => {
  const mockOnUploadComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(<ClipUpload onUploadComplete={mockOnUploadComplete} />);

  it("renders all form fields correctly", () => {
    renderComponent();

    expect(screen.getByText("Upload Gaming Clip")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search and select a GameSphere...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Share what makes this clip special...")).toBeInTheDocument();
    expect(screen.getByText("Upload Clip")).toBeInTheDocument();
  });

  it("opens the game sphere dropdown and selects a game sphere", () => {
    renderComponent();

    const input = screen.getByPlaceholderText("Search and select a GameSphere...");
    fireEvent.focus(input);

    expect(screen.getByText("League of Legends")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Valorant"));
    expect(input).toHaveValue("Valorant");
  });

  it("shows error when wrong file type is selected", () => {
    renderComponent();

    const fileInput = screen.getByLabelText(/Video File/i);
    const badFile = new File(["not-video"], "image.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [badFile] } });

    expect(screen.getByText("Please select a video file only")).toBeInTheDocument();
  });

  it("shows error when file is too large", () => {
    renderComponent();

    const fileInput = screen.getByLabelText(/Video File/i);
    const bigFile = new File([new ArrayBuffer(101 * 1024 * 1024)], "big.mp4", {
      type: "video/mp4",
    });

    fireEvent.change(fileInput, { target: { files: [bigFile] } });

    expect(screen.getByText(/File is too large/)).toBeInTheDocument();
  });

  it("accepts valid video file and shows selected file info", () => {
    renderComponent();

    const fileInput = screen.getByLabelText(/Video File/i);
    const validFile = new File([new ArrayBuffer(1024)], "clip.mp4", {
      type: "video/mp4",
    });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(screen.getByText(/Selected: clip.mp4/)).toBeInTheDocument();
  });

    it("shows error if required fields are missing on submit", async () => {
    renderComponent();

    // Provide only a valid file so that other fields remain missing
    const fileInput = screen.getByLabelText(/Video File/i);
    const validFile = new File([new ArrayBuffer(1024)], "clip.mp4", {
        type: "video/mp4",
    });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Trigger form submit explicitly
    fireEvent.submit(screen.getByText("Upload Clip").closest("form")!);

    // Wait for the error message to appear
    const errorMessage = await screen.findByText(/please fill in required fields/i);
    expect(errorMessage).toBeInTheDocument();
    });

  it("successfully uploads and calls onUploadComplete", async () => {
    renderComponent();

    // Select game sphere
    const gameSphereInput = screen.getByPlaceholderText("Search and select a GameSphere...");
    fireEvent.focus(gameSphereInput);
    fireEvent.click(await screen.findByText("Valorant"));

    // Add caption
    const captionInput = screen.getByPlaceholderText("Share what makes this clip special...");
    fireEvent.change(captionInput, { target: { value: "Amazing gameplay!" } });

    // Add valid file
    const fileInput = screen.getByLabelText(/Video File/i);
    const validFile = new File([new ArrayBuffer(1024)], "clip.mp4", { type: "video/mp4" });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Mock both API calls
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ uploadId: "123", uploadUrl: "/upload-url" }),
          ok: true,
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true }),
          ok: true,
        })
      );

    // Submit form
    fireEvent.submit(screen.getByText("Upload Clip").closest("form")!);

    // Wait for fetch and callback
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // Both API calls
      expect(mockOnUploadComplete).toHaveBeenCalled();
    });
  });

  it("closes dropdown when clicking outside", async () => {
    renderComponent();

    const input = screen.getByPlaceholderText("Search and select a GameSphere...");
    fireEvent.focus(input);

    expect(screen.getByText("League of Legends")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText("League of Legends")).not.toBeInTheDocument();
    });
  });
});

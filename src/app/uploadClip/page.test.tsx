/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import UploadClip from "./page";

jest.mock("@/components/clips/clipUpload", () => () => <div>Mock Clip Upload</div>);

describe("UploadClip Component", () => {
  it("renders the heading and the ClipUpload component", () => {
    render(<UploadClip />);

    expect(screen.getByText("Gaming Clips")).toBeInTheDocument();

    expect(screen.getByText("Mock Clip Upload")).toBeInTheDocument();
  });
});

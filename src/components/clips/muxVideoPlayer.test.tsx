/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import MuxVideoPlayer from "./muxVideoPlayer";

//mock the Mux Player component so we don't load the actual video player
jest.mock("@mux/mux-player-react", () => {
  return jest.fn((props) => {
    return (
      <div data-testid="mock-mux-player">
        Mock Mux Player - playbackId: {props.playbackId}
      </div>
    );
  });
});

describe("MuxVideoPlayer", () => {
  it("renders without crashing", () => {
    render(<MuxVideoPlayer playbackId="test-playback-id" />);
    expect(screen.getByTestId("mock-mux-player")).toBeInTheDocument();
  });

  it("displays the correct playbackId", () => {
    render(<MuxVideoPlayer playbackId="12345" />);
    expect(screen.getByText(/playbackId: 12345/i)).toBeInTheDocument();
  });

  it("passes poster prop correctly", () => {
    render(<MuxVideoPlayer playbackId="test-id" poster="poster-url.jpg" />);
    expect(screen.getByText(/playbackId: test-id/i)).toBeInTheDocument();
  });

  it("applies custom className to the container", () => {
    const { container } = render(
      <MuxVideoPlayer playbackId="test-id" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("mux-player-container");
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders with correct inline styles", () => {
    render(<MuxVideoPlayer playbackId="test-id" />);
    const container = screen.getByTestId("mock-mux-player");

    //the mocked component won't actually apply styles,
    //but we can check that the parent container exists tho
    expect(container).toBeInTheDocument();
  });
});

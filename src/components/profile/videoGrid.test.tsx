/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import VideoGrid from "./videoGrid";

describe("VideoGrid", () => {
  const mockPosts = [
    { id: 1, thumbnail: "thumb1.jpg" },
    { id: 2, thumbnail: "thumb2.jpg" },
  ];

  it("renders all video thumbnails", () => {
    render(<VideoGrid posts={mockPosts} />);
    const images = screen.getAllByAltText("hm");
    expect(images).toHaveLength(mockPosts.length);
  });

  it("renders correct thumbnails src", () => {
    render(<VideoGrid posts={mockPosts} />);
    const images = screen.getAllByAltText("hm");
    images.forEach((img, idx) => {
      expect(img).toHaveAttribute("src", mockPosts[idx].thumbnail);
    });
  });

  it("renders play icon overlay for each post", () => {
    render(<VideoGrid posts={mockPosts} />);
    const playIcons = screen.getAllByTestId("video-play-icon");
    expect(playIcons).toHaveLength(mockPosts.length);
  });

  it("handles empty posts array gracefully", () => {
    render(<VideoGrid posts={[]} />);
    expect(screen.queryByRole("img")).toBeNull();
  });
});

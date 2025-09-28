/**
 * @jest-environment jsdom
 */
import { ClipProcessingStatus } from "./Clip";

describe("ClipProcessingStatus Enum", () => {
  it("should have the correct values", () => {
    expect(ClipProcessingStatus.UPLOADING).toBe("uploading");
    expect(ClipProcessingStatus.PREPARING).toBe("preparing");
    expect(ClipProcessingStatus.READY).toBe("ready");
    expect(ClipProcessingStatus.ERRORED).toBe("errored");
  });

  it("should contain exactly 4 keys", () => {
    const keys = Object.keys(ClipProcessingStatus);
    expect(keys).toEqual(["UPLOADING", "PREPARING", "READY", "ERRORED"]);
  });
});

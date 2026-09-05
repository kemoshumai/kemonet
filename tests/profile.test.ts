import { describe, expect, it } from "vitest";
import {
  KemonetValidationError,
  parseAvatarReference,
  parseProfileDocument,
  serializeProfileDocument
} from "../src/index.js";

describe("parseProfileDocument", () => {
  it("parses a profile with an avatar", () => {
    expect(
      parseProfileDocument({
        version: 1,
        displayName: "  Alice  ",
        avatar: {
          url: "https://example.com/avatar.vrm",
          format: " vrm "
        }
      })
    ).toEqual({
      version: 1,
      displayName: "Alice",
      avatar: {
        url: "https://example.com/avatar.vrm",
        format: "vrm"
      }
    });
  });

  it("allows a profile without an avatar", () => {
    expect(
      parseProfileDocument({ version: 1, displayName: "Alice" })
    ).toEqual({ version: 1, displayName: "Alice" });
  });

  it("rejects non-http avatar URLs", () => {
    expect(() =>
      parseAvatarReference({
        url: "javascript:alert(1)",
        format: "vrm"
      })
    ).toThrow(KemonetValidationError);
  });

  it("rejects a profile with an unsupported version", () => {
    expect(() =>
      parseProfileDocument({ version: 2, displayName: "Alice" })
    ).toThrow("version: must be 1");
  });

  it("serializes a normalized profile", () => {
    expect(
      serializeProfileDocument({
        version: 1,
        displayName: " Alice "
      })
    ).toBe('{"version":1,"displayName":"Alice"}');
  });
});

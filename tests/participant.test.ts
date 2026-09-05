import { describe, expect, it } from "vitest";
import {
  decodeKemonetMessage,
  encodeKemonetMessage,
  parseKemonetMessage,
  parseParticipant,
  type AvatarStateChanged,
  type SessionJoined
} from "../src/index.js";

const state = {
  position: { x: 1, y: 0, z: -2 },
  rotation: { x: 0, y: 0.7, z: 0, w: 0.7 },
  animation: "idle"
} as const;

describe("Kemonet messages", () => {
  it("round-trips an avatar state change", () => {
    const message: AvatarStateChanged = {
      version: 1,
      type: "avatar-state-changed",
      participantId: "participant-1",
      state
    };

    expect(decodeKemonetMessage(encodeKemonetMessage(message))).toEqual(message);
  });

  it("parses a session snapshot", () => {
    const message: SessionJoined = {
      version: 1,
      type: "session-joined",
      self: {
        id: "self",
        profile: { version: 1, displayName: "Alice" }
      },
      selfState: state,
      participants: [
        {
          participant: {
            id: "other",
            profile: { version: 1, displayName: "Bob" }
          },
          state
        }
      ]
    };

    expect(parseKemonetMessage(message)).toEqual(message);
  });

  it("parses a participant", () => {
    expect(
      parseParticipant({
        id: "participant-1",
        profile: { version: 1, displayName: "Alice" }
      })
    ).toEqual({
      id: "participant-1",
      profile: { version: 1, displayName: "Alice" }
    });
  });

  it("rejects a message with an unknown type", () => {
    expect(() =>
      parseKemonetMessage({ version: 1, type: "unknown" })
    ).toThrow("message.type: is not supported");
  });

  it("rejects a message with an unknown protocol version", () => {
    expect(() =>
      parseKemonetMessage({ version: 2, type: "participant-left", participantId: "id" })
    ).toThrow("message.version: must be 1");
  });

  it("rejects malformed JSON", () => {
    expect(() => decodeKemonetMessage("not-json")).toThrow(
      "message: must contain valid JSON"
    );
  });
});

import {
  isRecord,
  KemonetValidationError,
  requireFiniteNumber,
  requireNonEmptyString
} from "./validation.js";
import { parseProfileDocument, type ProfileDocument } from "./profile.js";

export type ParticipantId = string;

export interface Participant {
  readonly id: ParticipantId;
  readonly profile: ProfileDocument;
}

export interface Vector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Quaternion {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
}

export interface AvatarState {
  readonly position: Vector3;
  readonly rotation: Quaternion;
  readonly animation?: string;
}

export const KEMONET_PROTOCOL_VERSION = 1 as const;

interface ProtocolMessage {
  readonly version: typeof KEMONET_PROTOCOL_VERSION;
}

export interface JoinRequest extends ProtocolMessage {
  readonly type: "join";
  readonly profile: ProfileDocument;
}

export interface ProfileUpdateRequest extends ProtocolMessage {
  readonly type: "profile-update";
  readonly profile: ProfileDocument;
}

export interface AvatarStateUpdate extends ProtocolMessage {
  readonly type: "avatar-state-update";
  readonly state: AvatarState;
}

export interface ParticipantPresence {
  readonly participant: Participant;
  readonly state: AvatarState;
}

export interface SessionJoined extends ProtocolMessage {
  readonly type: "session-joined";
  readonly self: Participant;
  readonly participants: readonly ParticipantPresence[];
}

export interface ParticipantJoined extends ProtocolMessage {
  readonly type: "participant-joined";
  readonly participant: Participant;
  readonly state: AvatarState;
}

export interface ParticipantLeft extends ProtocolMessage {
  readonly type: "participant-left";
  readonly participantId: ParticipantId;
}

export interface ParticipantProfileChanged extends ProtocolMessage {
  readonly type: "participant-profile-changed";
  readonly participantId: ParticipantId;
  readonly profile: ProfileDocument;
}

export interface AvatarStateChanged extends ProtocolMessage {
  readonly type: "avatar-state-changed";
  readonly participantId: ParticipantId;
  readonly state: AvatarState;
}

export interface ErrorMessage extends ProtocolMessage {
  readonly type: "error";
  readonly code: string;
  readonly message: string;
}

export type KemonetMessage =
  | JoinRequest
  | ProfileUpdateRequest
  | AvatarStateUpdate
  | SessionJoined
  | ParticipantJoined
  | ParticipantLeft
  | ParticipantProfileChanged
  | AvatarStateChanged
  | ErrorMessage;

export function parseParticipantId(value: unknown): ParticipantId {
  return requireNonEmptyString(value, "participantId", 128);
}

export function parseParticipant(value: unknown): Participant {
  if (!isRecord(value)) {
    throw new KemonetValidationError("participant", "must be an object");
  }

  return {
    id: parseParticipantId(value["id"]),
    profile: parseProfileDocument(value["profile"])
  };
}

export function parseVector3(value: unknown, path = "vector"): Vector3 {
  if (!isRecord(value)) {
    throw new KemonetValidationError(path, "must be an object");
  }

  return {
    x: requireFiniteNumber(value["x"], `${path}.x`),
    y: requireFiniteNumber(value["y"], `${path}.y`),
    z: requireFiniteNumber(value["z"], `${path}.z`)
  };
}

export function parseQuaternion(value: unknown, path = "quaternion"): Quaternion {
  if (!isRecord(value)) {
    throw new KemonetValidationError(path, "must be an object");
  }

  return {
    x: requireFiniteNumber(value["x"], `${path}.x`),
    y: requireFiniteNumber(value["y"], `${path}.y`),
    z: requireFiniteNumber(value["z"], `${path}.z`),
    w: requireFiniteNumber(value["w"], `${path}.w`)
  };
}

export function parseAvatarState(value: unknown): AvatarState {
  if (!isRecord(value)) {
    throw new KemonetValidationError("state", "must be an object");
  }

  const animationValue = value["animation"];
  const state: AvatarState = {
    position: parseVector3(value["position"], "state.position"),
    rotation: parseQuaternion(value["rotation"], "state.rotation")
  };

  if (animationValue !== undefined) {
    return {
      ...state,
      animation: requireNonEmptyString(animationValue, "state.animation", 64)
    };
  }

  return state;
}

function parsePresence(value: unknown, path: string): ParticipantPresence {
  if (!isRecord(value)) {
    throw new KemonetValidationError(path, "must be an object");
  }

  return {
    participant: parseParticipant(value["participant"]),
    state: parseAvatarState(value["state"])
  };
}

function parseParticipants(value: unknown): readonly ParticipantPresence[] {
  if (!Array.isArray(value)) {
    throw new KemonetValidationError("participants", "must be an array");
  }

  return value.map((presence, index) =>
    parsePresence(presence, `participants[${String(index)}]`)
  );
}

function parseProtocolVersion(value: unknown): typeof KEMONET_PROTOCOL_VERSION {
  if (value !== KEMONET_PROTOCOL_VERSION) {
    throw new KemonetValidationError(
      "message.version",
      `must be ${String(KEMONET_PROTOCOL_VERSION)}`
    );
  }

  return KEMONET_PROTOCOL_VERSION;
}

function withVersion(value: Record<string, unknown>): typeof KEMONET_PROTOCOL_VERSION {
  return parseProtocolVersion(value["version"]);
}

export function encodeKemonetMessage(message: KemonetMessage): string {
  return JSON.stringify(parseKemonetMessage(message));
}

export function decodeKemonetMessage(value: string): KemonetMessage {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value) as unknown;
  } catch {
    throw new KemonetValidationError("message", "must contain valid JSON");
  }

  return parseKemonetMessage(parsed);
}

export function parseKemonetMessage(value: unknown): KemonetMessage {
  if (!isRecord(value)) {
    throw new KemonetValidationError("message", "must be an object");
  }

  const version = withVersion(value);

  switch (value["type"]) {
    case "join":
      return {
        version,
        type: "join",
        profile: parseProfileDocument(value["profile"])
      };
    case "profile-update":
      return {
        version,
        type: "profile-update",
        profile: parseProfileDocument(value["profile"])
      };
    case "avatar-state-update":
      return {
        version,
        type: "avatar-state-update",
        state: parseAvatarState(value["state"])
      };
    case "session-joined":
      return {
        version,
        type: "session-joined",
        self: parseParticipant(value["self"]),
        participants: parseParticipants(value["participants"])
      };
    case "participant-joined":
      return {
        version,
        type: "participant-joined",
        participant: parseParticipant(value["participant"]),
        state: parseAvatarState(value["state"])
      };
    case "participant-left":
      return {
        version,
        type: "participant-left",
        participantId: parseParticipantId(value["participantId"])
      };
    case "participant-profile-changed":
      return {
        version,
        type: "participant-profile-changed",
        participantId: parseParticipantId(value["participantId"]),
        profile: parseProfileDocument(value["profile"])
      };
    case "avatar-state-changed":
      return {
        version,
        type: "avatar-state-changed",
        participantId: parseParticipantId(value["participantId"]),
        state: parseAvatarState(value["state"])
      };
    case "error":
      return {
        version,
        type: "error",
        code: requireNonEmptyString(value["code"], "code", 64),
        message: requireNonEmptyString(value["message"], "message", 256)
      };
    default:
      throw new KemonetValidationError("message.type", "is not supported");
  }
}

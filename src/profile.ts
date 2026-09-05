import {
  isRecord,
  KemonetValidationError,
  requireHttpUrl,
  requireNonEmptyString
} from "./validation.js";

export const KEMONET_PROFILE_DOCUMENT_VERSION = 1 as const;

export interface AvatarReference {
  readonly url: string;
  readonly format: string;
}

export interface ProfileDocument {
  readonly version: typeof KEMONET_PROFILE_DOCUMENT_VERSION;
  readonly displayName: string;
  readonly avatar?: AvatarReference;
}

const MAX_DISPLAY_NAME_LENGTH = 80;
const MAX_FORMAT_LENGTH = 64;

export function parseAvatarReference(input: unknown): AvatarReference {
  if (!isRecord(input)) {
    throw new KemonetValidationError("avatar", "must be an object");
  }

  return {
    url: requireHttpUrl(input["url"], "avatar.url"),
    format: requireNonEmptyString(
      input["format"],
      "avatar.format",
      MAX_FORMAT_LENGTH
    )
  };
}

export function parseProfileDocument(input: unknown): ProfileDocument {
  if (!isRecord(input)) {
    throw new KemonetValidationError("profile", "must be an object");
  }

  if (input["version"] !== KEMONET_PROFILE_DOCUMENT_VERSION) {
    throw new KemonetValidationError(
      "version",
      `must be ${String(KEMONET_PROFILE_DOCUMENT_VERSION)}`
    );
  }

  const parsed: ProfileDocument = {
    version: KEMONET_PROFILE_DOCUMENT_VERSION,
    displayName: requireNonEmptyString(
      input["displayName"],
      "displayName",
      MAX_DISPLAY_NAME_LENGTH
    )
  };

  if (input["avatar"] !== undefined) {
    return { ...parsed, avatar: parseAvatarReference(input["avatar"]) };
  }

  return parsed;
}

export function serializeProfileDocument(profile: ProfileDocument): string {
  return JSON.stringify(parseProfileDocument(profile));
}

export class KemonetValidationError extends Error {
  public readonly path: string;

  public constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = "KemonetValidationError";
    this.path = path;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    throw new KemonetValidationError(path, "must be a string");
  }

  return value;
}

export function requireNonEmptyString(
  value: unknown,
  path: string,
  maxLength: number
): string {
  const stringValue = requireString(value, path);
  const normalized = stringValue.trim();

  if (normalized.length === 0) {
    throw new KemonetValidationError(path, "must not be empty");
  }

  if (normalized.length > maxLength) {
    throw new KemonetValidationError(
      path,
      `must not exceed ${String(maxLength)} characters`
    );
  }

  return normalized;
}

export function requireFiniteNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new KemonetValidationError(path, "must be a finite number");
  }

  return value;
}

export function requireHttpUrl(value: unknown, path: string): string {
  const stringValue = requireString(value, path);

  if (stringValue.length > 4096) {
    throw new KemonetValidationError(path, "must not exceed 4096 characters");
  }

  if (stringValue !== stringValue.trim()) {
    throw new KemonetValidationError(path, "must not have leading or trailing whitespace");
  }

  let url: URL;
  try {
    url = new URL(stringValue);
  } catch {
    throw new KemonetValidationError(path, "must be an absolute URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new KemonetValidationError(path, "must use HTTP or HTTPS");
  }

  if (url.username !== "" || url.password !== "") {
    throw new KemonetValidationError(path, "must not contain URL credentials");
  }

  return url.href;
}

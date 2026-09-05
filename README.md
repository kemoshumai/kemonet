# kemonet

Framework-agnostic TypeScript library for the Kemonet platform.

Kemonet is the reusable platform implementation for independent Mondos. The core package contains no application UI, demo content, renderer, avatar loader, persistence service, or network server.

## Public API

The package currently provides validated, transport-independent models for:

- Kemonet Profile Document v1
- Extensible avatar references
- Mondo session participants
- Avatar position, orientation, and animation state
- Versioned session and participant messages

Example:

```ts
import {
  encodeKemonetMessage,
  parseProfileDocument,
  type ProfileDocument
} from "kemonet";

const profile: ProfileDocument = parseProfileDocument({
  version: 1,
  displayName: "Example User",
  avatar: {
    url: "https://avatar.example/assets/example.vrm",
    format: "vrm"
  }
});

const message = encodeKemonetMessage({
  version: 1,
  type: "join",
  profile
});
```

All untrusted profile and protocol data must be parsed at the application boundary. Parsing validates structure and URL syntax; it does not fetch external assets, authenticate a user, verify ownership, or make an avatar safe to render.

## Development

```sh
npm install
npm run check
npm run build
npm run mutation
```

`npm run semgrep` requires the Semgrep CLI. Mutation testing is available once tests exist.

## Architecture

Read these documents before changing the public API:

- [`docs/kemonet-concept-handoff.md`](docs/kemonet-concept-handoff.md): concept extracted from the draft paper
- [`docs/first-implementation-handoff.md`](docs/first-implementation-handoff.md): decisions, boundaries, and first-milestone architecture

Kemonet must remain independent of `kemonet-about`. `kemonet-about` is one concrete Mondo consumer and must use only Kemonet's public package exports.

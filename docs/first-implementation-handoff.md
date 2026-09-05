# First Implementation Architecture Handoff

> This document was written by an AI to preserve decisions made in the project discussion for future AI sessions. Unlike `kemonet-concept-handoff.md`, which primarily summarizes the draft paper, this document records decisions made after reviewing that draft. It is an implementation handoff, not a claim that the described features already exist.
>
> Read this document together with `kemonet-concept-handoff.md` and the applicable `AGENTS.md` files before designing or implementing Kemonet features.

## 1. Status at the time of this handoff

The Kemonet repository is still a framework-agnostic TypeScript library scaffold. The domain APIs, Avataro protocol, Mondo session protocol, OIDC integration, avatar storage, rendering, and real-time multiplayer behavior described below have not yet been implemented.

The first implementation branch was created as:

```text
feat/first-domain-api
```

The intended first milestone is no longer a types-only experiment. It is a vertical slice developed in parallel with `kemonet-about`:

- Kemonet defines production-grade, reusable public models and protocols.
- `kemonet-about` consumes only Kemonet's public package API.
- `kemonet-about` acts as a real Mondo and demonstrates the current usable extent of Kemonet.
- The first milestone includes multiple simultaneous participants and controllable avatars.

Kemonet itself must never contain a temporary demo implementation, even during this milestone.

## 2. Non-negotiable repository boundary

Kemonet and `kemonet-about` have different responsibilities.

### Kemonet

Kemonet is the public, general-purpose implementation of the platform specification. Every Kemonet change must make sense without `kemonet-about` and must be reusable by unrelated Mondos.

Kemonet must not depend on:

- `kemonet-about`
- Files, modules, routes, assets, fixtures, or servers owned by `kemonet-about`
- Any particular demo page or presentation
- Any particular Mondo
- Any particular Avataro deployment
- Google or any other upstream login provider
- Any particular OIDC provider implementation
- React, Vite, or another application framework
- Three.js, Babylon.js, or another rendering engine
- A VRM or glTF renderer
- A particular database, object store, or profile storage service
- A particular signaling server implementation
- WebSocket as the only possible signaling transport
- P2P mesh, SFU, or another single real-time topology
- Hard-coded demo users, profiles, avatars, URLs, issuer names, or domains

Kemonet must not contain:

- Demo avatars or other demo assets
- Demo profile documents
- Demo-only fallbacks
- `kemonet-about` compatibility branches
- Imports from `kemonet-about`
- Source-level workspace shortcuts that would be unavailable to a third-party consumer
- UI behavior or game rules belonging to a specific Mondo
- Authentication shortcuts represented as trusted identity

Kemonet may define transport-independent and renderer-independent models, parsers, validators, state machines, protocol messages, and extension points. It may later provide optional adapters, but application-specific adapters must not become requirements of the core API.

### kemonet-about

`kemonet-about` is a consumer of Kemonet and one concrete Mondo. It is intentionally close to the position of a third-party user.

`kemonet-about` owns:

- The explanatory experience and visual design
- Its Three.js or other renderer integration
- VRM and glTF loading
- Its default licensed demo avatar
- Profile editing user interfaces
- Avatar upload user interfaces
- Storage used by this Mondo
- Its server routes and deployment
- Session hosting for this Mondo
- Mondo-specific controls, physics, interactions, and moderation
- Friendly fallback presentation when an avatar cannot be rendered

If work on `kemonet-about` reveals a missing capability, first determine whether the capability is generally reusable by unrelated Mondos. Only reusable platform behavior belongs in Kemonet. A need specific to the explanatory demo remains in `kemonet-about`, even if placing it in Kemonet would reduce code in the short term.

## 3. Dependency and consumption rule

`kemonet-about` must consume Kemonet as a package through Kemonet's public exports. It must not import files from the sibling checkout or from Kemonet's private source tree.

During development, the selected dependency method is a Git dependency referencing the Kemonet GitHub repository and an exact revision or intentionally selected branch:

```json
{
  "dependencies": {
    "kemonet": "github:kemoshumai/kemonet#<revision>"
  }
}
```

Prefer an exact commit for reproducibility once a corresponding Kemonet commit exists. A temporary implementation branch reference may be used while both repositories are actively developed, but it must not silently track unrelated future changes.

The Kemonet package must build and expose declarations and JavaScript correctly when installed through Git. `kemonet-about` must import only documented public exports, for example:

```ts
import { parseProfileDocument } from "kemonet";
```

The workspace containing both repositories must not be used to create an undeclared source dependency.

## 4. First milestone scope

The first milestone includes multiplayer from the beginning rather than adding it after a single-user prototype.

### Kemonet responsibilities in the first milestone

Kemonet should define production-grade, reusable APIs for at least:

- Kemonet Profile Document v1
- Extensible avatar references
- Unauthenticated session participants
- Session join and leave messages
- Participant profile updates
- Avatar transform and animation-state messages
- Runtime parsing and validation at trust boundaries
- Transport-independent protocol types
- Versioning or discrimination needed to evolve protocol messages safely

Kemonet should not implement rendering, asset upload, persistent storage, a demo server, or a `kemonet-about`-specific transport.

### kemonet-about responsibilities in the first milestone

`kemonet-about` should provide a working multi-user Mondo with:

- Guest profile creation without OIDC
- Server-side persistence of guest profiles
- A licensed, redistributable default VRM stored in `kemonet-about`
- User upload of VRM and supported glTF assets
- Server-side persistence and HTTP(S) delivery of uploaded avatar assets
- Avatar display for the local and remote participants
- Movement controls
- Camera controls
- Jumping or another small physical interaction
- Participant join and leave behavior
- Synchronization of position, rotation, and relevant animation state
- Clear errors and a Mondo-owned fallback when an avatar cannot be loaded
- Use of Kemonet's public models, parsers, and protocol messages

The existence of upload, persistence, and multiplayer servers in `kemonet-about` does not make those concrete servers part of Kemonet.

## 5. Kemonet Profile Document v1

A Kemonet Profile Document is a public interchange model. It is not an authentication credential and does not prove ownership, identity, or trustworthiness.

The agreed conceptual form is:

```json
{
  "version": 1,
  "displayName": "Example User",
  "avatar": {
    "url": "https://avatar.example/assets/example.vrm",
    "format": "vrm"
  }
}
```

The avatar is optional in the Kemonet specification:

```json
{
  "version": 1,
  "displayName": "Example User"
}
```

A Mondo may require an avatar as an application policy. In particular, `kemonet-about` may require avatar selection during its initial user experience while the reusable Kemonet format keeps `avatar` optional.

### Required semantics

- `version` identifies the profile document version. The first version is `1`.
- `displayName` is presentation data, not a unique identifier.
- `avatar` is optional presentation data.
- `avatar.url` is an absolute HTTP(S) URL.
- `avatar.format` is a non-empty, extensible format identifier.
- Unknown avatar formats are not globally invalid merely because one Mondo cannot render them.
- Parsing a profile does not fetch its avatar URL.
- Parsing a profile does not assert that the URL owner is the profile owner.
- Parsing a profile does not make the referenced file safe.

Exact string limits, canonical format identifiers, extension behavior, and forward-compatibility behavior still require careful specification during implementation. These details must be documented and tested rather than chosen implicitly.

## 6. Profile document, identity, and participant separation

Three concepts must not be conflated.

### Profile document

A profile document contains user-controlled presentation data such as a display name and avatar reference. It is not trusted identity.

### Authenticated identity

An authenticated identity will later be represented by an OIDC issuer and subject pair:

```text
(issuer, subject)
```

A `subject` alone is not globally unique. Email addresses must not be used as stable identity keys. An authenticated identity must only be created after the relevant token and issuer have been verified.

### Session participant

A participant is an entity present in a particular Mondo session. In the unauthenticated first milestone, the Mondo session service assigns an opaque participant identifier and associates it with a profile document.

Conceptually:

```json
{
  "id": "server-generated-opaque-session-id",
  "profile": {
    "version": 1,
    "displayName": "Example User",
    "avatar": {
      "url": "https://mondo.example/assets/example.vrm",
      "format": "vrm"
    }
  }
}
```

A guest participant identifier is not an OIDC subject, a global Kemonet identity, or proof of a person. Never populate fake `issuer` or `subject` fields for a guest and never describe an arbitrary client-provided identifier as authenticated.

When OIDC is added later, a session participant may be associated with a separately verified authenticated identity. This association must not erase the distinction between session presence, profile presentation, and identity.

## 7. Profile and avatar persistence in kemonet-about

For the first milestone, profile values are entered and saved by `kemonet-about` without authentication.

Persistence must be designed so multiple users can retrieve the profile and avatar. Browser-only `localStorage` is insufficient for shared avatar delivery.

The intended division is:

- `kemonet-about` stores the profile on its server side.
- `kemonet-about` stores uploaded avatar assets on its server side or in storage controlled by its deployment.
- `kemonet-about` issues retrievable HTTP(S) URLs for saved avatars.
- The browser may store a session or capability needed to edit or reuse its profile.
- Edit credentials, session secrets, and private capabilities must not appear in public profile documents or multiplayer broadcasts.
- A URL containing a bearer secret must not be used as a public avatar URL.

The concrete database, object storage, session mechanism, upload API, deployment provider, retention policy, and deletion behavior have not yet been selected. They are `kemonet-about` design decisions unless a genuinely general protocol requirement is discovered.

## 8. Avatar format decisions

Kemonet's avatar reference is extensible. Kemonet must not restrict all Mondos to one renderer or one avatar format.

The first `kemonet-about` implementation supports:

- VRM
- glTF

The practical initial upload subset should be:

- `.vrm`
- Binary glTF (`.glb`)

Text JSON `.gltf` files may reference separate `.bin`, image, or other resources. Supporting arbitrary `.gltf` uploads therefore requires a bundle format, safe archive extraction, path validation, content rewriting or stable relative asset URLs, limits, and lifecycle management. It should not be claimed as complete merely because a loader can open some standalone `.gltf` files.

If the initial implementation accepts only VRM and GLB uploads, describe that accurately as the initial upload subset of VRM and glTF. Do not claim support for every glTF packaging arrangement.

### Default avatar

The default avatar belongs only in `kemonet-about`. Before committing it:

- Verify that redistribution is allowed.
- Record the source, author, license, and applicable conditions.
- Include required attribution and license text.
- Confirm that use in an interactive web experience is permitted.
- Do not copy the asset into Kemonet.

### Asset safety

A syntactically valid avatar reference does not imply a safe or renderable asset. The consuming Mondo and its storage pipeline should enforce appropriate controls, potentially including:

- Allowed upload types
- File-size limits
- Content inspection independent of the filename
- Parser and loader error isolation
- Limits on geometry, textures, bones, materials, and animation complexity
- Restrictions on external resources
- Safe content delivery headers
- A separate asset origin where appropriate
- Timeouts and memory safeguards

Exact limits remain to be selected by `kemonet-about`. General reusable validation semantics may later be considered for Kemonet, but demo-specific operational limits must not be placed in Kemonet merely for convenience.

## 9. Multiplayer and transport boundary

The first milestone must support multiple simultaneous participants. Kemonet should define the protocol meaning while remaining independent of a concrete transport topology.

Likely reusable message concepts include:

- Join request or session admission result
- Participant joined
- Participant left
- Participant profile changed
- Avatar transform changed
- Avatar animation state changed
- Protocol or schema version mismatch
- Error or rejection information where interoperable behavior requires it

Transform data will likely include position and orientation. Animation data should carry semantic state only where it is general enough to be interpreted by different Mondo implementations. Kemonet must not encode `kemonet-about` key bindings, scene object names, or renderer-specific animation objects.

The following details remain undecided and must be designed explicitly:

- Whether the first `kemonet-about` transport is WebSocket, WebRTC data channels, or a staged combination
- How peers discover one another
- Whether the server is authoritative for position in the first Mondo
- Update rate, interpolation, ordering, loss tolerance, and backpressure
- Reconnection and resume behavior
- Session identifiers and admission
- Validation and rate limiting of remote state
- How avatar profile changes propagate
- Whether voice is part of the first milestone

The draft prefers WebRTC for peer communication and allows signaling through WebSocket. A practical first implementation must not quietly turn a temporary WebSocket-only synchronization system into the Kemonet protocol itself. Protocol data and transport framing must remain separable.

## 10. Avataro is an independent IdP

An Avataro is independently operated and appears to a Mondo as an OIDC Identity Provider.

From the Mondo's perspective:

```text
Mondo -- OIDC --> Avataro
```

The Mondo needs to understand the Avataro's OIDC-facing behavior, including its issuer, discovery metadata, endpoints, signing keys, subject identifiers, scopes, consent, and Kemonet profile integration. The Mondo does not need to know how the Avataro authenticates its own users internally.

An Avataro may choose Google as an upstream login method:

```text
Mondo -- OIDC --> Avataro -- internal upstream login --> Google
```

In this arrangement:

- The Avataro is an OIDC IdP to the Mondo.
- The Avataro is an OIDC client of Google internally.
- Google is not the Avataro.
- Google is not part of the Kemonet protocol.
- Kemonet does not depend on Google.
- The Mondo does not receive or rely on Google's subject identifier.
- The choice to use Google is entirely the Avataro operator's implementation decision.

Another Avataro may use passkeys, an organizational IdP, another upstream provider, local credentials, or multiple login methods. All should be possible without changing the Mondo-facing Kemonet protocol.

### Subject separation

An Avataro using Google should keep the upstream identity association internal and issue its own subject to a Mondo.

Conceptually:

```text
Internal Avataro association:
  upstream issuer  = https://accounts.google.com
  upstream subject = Google-specific subject
  Avataro user     = Avataro-internal account

Mondo-facing identity:
  issuer  = https://avataro.example
  subject = Avataro-issued subject
```

The Google email address and Google subject must not become Kemonet's global identity key. An Avataro may later change or add upstream login methods without changing the identity relationship it presents to Mondos.

## 11. Whether to operate a Kemonet-specific IdP

A Kemonet-specific profile host or Avataro implementation is useful, but a single central official Avataro must not become mandatory.

The architecture allows many independent Avataros. An official or project-operated Avataro, if created, is one interoperable deployment among others, not the central authority required to enter every Mondo.

The project should not initially build an original password authentication system merely to operate an Avataro. Password storage, MFA, recovery, abuse prevention, and account security carry substantial responsibility unrelated to the central interoperability goal. An Avataro can delegate user authentication to established upstream providers while remaining an independent Mondo-facing IdP.

Kemonet should specify the interoperability boundary between Avataros and Mondos. It should not specify which upstream login provider an Avataro must use.

## 12. Standard authenticated user flow

The intended future user experience when entering a Mondo with an Avataro is:

1. The user opens the Mondo URL in a compatible browser.
2. The Mondo offers entry with an Avataro and may optionally offer guest entry.
3. The user chooses a previously used Avataro or enters an Avataro issuer/address.
4. The browser redirects to the Avataro through OIDC.
5. If necessary, the Avataro authenticates the user using its chosen method.
6. The user selects or confirms the profile and avatar to use.
7. The Avataro displays the information and permissions requested by the Mondo.
8. The user grants or denies consent.
9. The Avataro redirects the browser back to the Mondo.
10. The Mondo validates issuer, signature, audience, expiration, state, nonce, and other required OIDC properties.
11. The Mondo obtains only the permitted Kemonet profile information.
12. The Mondo validates and loads the avatar according to its own supported formats and safety policy.
13. The Mondo admits the user to its multiplayer session.

A returning user may be offered the previously used Avataro for convenience. Remembering an Avataro must not make it mandatory or silently prevent selection of another interoperable Avataro.

A Mondo may restrict accepted issuers for security, moderation, or operational reasons, but such restrictions are Mondo policy. Kemonet's architecture must not hard-code a universal mandatory issuer.

## 13. First-milestone guest flow in kemonet-about

OIDC is not part of the first milestone. `kemonet-about` should provide a guest flow that preserves the distinction between profile and identity:

1. The user opens `kemonet-about`.
2. The user enters a display name.
3. The user selects the licensed included avatar or uploads VRM/GLB.
4. `kemonet-about` saves the profile and asset on its server side.
5. The profile is parsed and validated according to Kemonet Profile Document v1.
6. `kemonet-about` retains a safe session or editing capability for that browser.
7. The Mondo creates an opaque guest participant for the session.
8. The user's avatar is loaded and displayed.
9. The user enters the multi-user session.
10. Other participants receive the public profile and synchronized avatar state.

On a return visit, `kemonet-about` may offer the saved guest profile, editing, or creation of another profile. This convenience does not make the guest profile an authenticated or portable global identity.

## 14. Future OIDC and Avataro work

OIDC should follow the guest multiplayer milestone rather than being simulated with fake issuer or subject values.

Future Kemonet work is expected to specify:

- Avataro discovery requirements
- OIDC client behavior expected of a Mondo
- Verified authenticated identity models
- Required and optional scopes
- How a Kemonet Profile Document is obtained after consent
- Whether profile data is delivered as an OIDC claim, from UserInfo, from a separate endpoint, or through a combination
- Claim naming and collision avoidance
- Issuer and audience validation
- Subject handling
- Consent and profile selection
- Profile refresh and revocation behavior

OIDC claims and the Kemonet Profile Document must remain separate concepts. An adapter may map verified OIDC output into a Kemonet domain model, but the domain model should not be accidentally coupled to Google's claims or to one Avataro implementation.

## 15. Decisions still open

The following matters were not decided in the discussion represented by this handoff:

- Exact TypeScript public API names
- Exact Profile Document JSON Schema and string limits
- Canonical media type for a Kemonet Profile Document
- Canonical avatar format identifiers
- Forward-compatible handling of unknown profile fields and versions
- First multiplayer transport and topology
- Authoritative-state and anti-cheat policy
- Voice communication in the first milestone
- `kemonet-about` server framework and deployment target
- Database and asset storage implementation
- Upload limits and asset validation limits
- Profile editing authorization and recovery
- Retention and deletion policy
- Exact default avatar asset and license
- Exact movement, camera, and interaction design
- Avatar animation retargeting across VRM and generic GLB files
- OIDC scope names and custom claim names
- Whether a public profile URL is part of the eventual Avataro specification
- Whether one Avataro account has one profile or multiple selectable profiles
- Mondo issuer allow-list or trust-discovery policy

Future work must distinguish these open questions from the decisions already recorded above. Do not treat an implementation convenience as an agreed specification without documenting the decision.

## 16. Required verification discipline

Changes spanning both repositories must remain understandable and testable independently.

For Kemonet:

- Test runtime validation with valid, invalid, boundary, and property-generated inputs.
- Keep transport and renderer dependencies out of the core package.
- Verify package build output and public exports.
- Run all available type checks, tests, linting, dependency checks, dead-code checks, Semgrep rules, and relevant mutation tests.

For `kemonet-about`:

- Install Kemonet through the declared Git package dependency.
- Do not resolve imports from the sibling Kemonet source checkout.
- Test profile persistence and unauthorized editing boundaries.
- Test upload rejection and loader failures.
- Test participant join, update, leave, reconnect, and malformed-message behavior.
- Run its build and all available quality checks independently.

A successful `kemonet-about` demo is evidence that Kemonet's public API is usable. It is not permission to introduce dependencies from Kemonet back to `kemonet-about`.

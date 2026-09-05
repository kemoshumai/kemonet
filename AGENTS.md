# Kemonet Agent Instructions

Read `docs/kemonet-concept-handoff.md` and `docs/first-implementation-handoff.md` completely before designing or implementing domain behavior.

Kemonet is the production-grade, public, reusable platform implementation. It is never a demo implementation, including during early milestones.

## Repository boundary

- Kemonet must build, test, and remain useful without `kemonet-about`.
- Never import from, reference, or depend on `kemonet-about`.
- Never use the sibling workspace checkout to create an undeclared dependency.
- Never add demo assets, demo profiles, demo URLs, fixtures, presentation behavior, or `kemonet-about` compatibility code to Kemonet.
- Add only capabilities reusable by unrelated Mondos and Avataros.
- Keep Mondo-specific UI, rendering, controls, game rules, persistence, deployment, and operational policy outside Kemonet.

## Dependency boundaries

The Kemonet core must not depend on a particular:

- Mondo or Avataro deployment
- Upstream login provider such as Google
- UI or application framework
- Rendering engine
- Avatar renderer or asset loader
- Database or object store
- Signaling transport
- Real-time network topology

Prefer framework-independent, renderer-independent, storage-independent, and transport-independent public models, parsers, validators, state machines, protocols, and extension points.

## Identity boundaries

Do not conflate:

- A user-controlled profile document
- A verified OIDC identity represented by issuer and subject
- A participant present in one Mondo session

A guest participant is not an authenticated identity. Never invent fake issuer or subject values for guest sessions. Email addresses are not stable identity keys.

An Avataro is independently operated and is an OIDC IdP from a Mondo's perspective. An Avataro may internally use Google or another upstream login provider, but that choice is private to the Avataro implementation. Kemonet must not depend on Google, and a Mondo must not depend on an Avataro's upstream provider.

## Consumer relationship

`kemonet-about` is one third-party-style consumer and one concrete Mondo. It must use Kemonet through documented package exports. When its development reveals a missing capability, add it to Kemonet only if it is genuinely reusable by unrelated consumers.

Keep changes to Kemonet and `kemonet-about` separated into independently understandable commits and verify each repository independently.

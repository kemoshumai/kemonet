# Kemonet Concept Handoff

> This document was written by an AI after reading the draft paper, for carrying the AI's understanding into future AI sessions. It only organizes concepts found in the draft. Nothing in this document should be treated as an implemented feature or a finalized design.
>
> The draft paper is titled `Kemoverse: Federated virtual universes on Web`. In the draft, `Kemoverse` is interpreted as the current project, `Kemonet`.
>
> Decisions made after reviewing the draft, including strict repository boundaries, the first multiplayer milestone, profile and identity semantics, and the Avataro/OIDC model, are recorded in `first-implementation-handoff.md`. Future work must read both documents; this draft summary does not override later recorded decisions.

## 1. Concept summary

Kemonet aims to be a **federated virtual-world platform based on the ideas of the Web**, rather than a closed, single platform tied to one company's client, account system, SDK, or content infrastructure.

Each virtual world is provided as an independent website or web application. The worlds are connected through standardized Web technologies and protocols. World operators and creators manage their content and logic on their own servers. Users visit a world through a compatible browser and a URL, without installing a dedicated client application.

The central ideas are:

- Federation between independent virtual worlds
- Low barriers to entry comparable to ordinary websites
- Freedom for world creators to implement and operate their worlds
- Portability of user identity and avatars
- Real-time communication based on standard protocols
- Security and privacy that do not depend on trusting one central operator

## 2. Problems to address

The draft identifies the following problems with existing virtual-world services as its starting point:

- Users must install a dedicated client application
- Users must create an account specific to the platform
- Creators must work within a platform-specific SDK and terms, then upload their content to servers operated by the platform
- Avatars, worlds, and social graphs are bound to one service
- A unilateral policy change by the operator can threaten a creator's freedom of expression and continuity of activity
- Dependence on one platform creates vendor lock-in

Kemonet is intended to reduce these dependencies and this closedness by making each virtual world independent like a website and connecting worlds through common protocols.

## 3. Terms and components

### 3.1 Mondo

`Mondo` is an individual virtual world in the draft.

A Mondo is provided as an independent website or web application, has its own domain name, and is accessed over HTTP(S). A user can visit a Mondo by opening its URL in a WebXR-compatible browser, without requiring a dedicated client application.

The owner or creator of a Mondo manages the following on their own server:

- 3D environments
- 3D objects
- Interactions
- Scripts
- User interfaces
- Synchronization methods
- Content and assets

Rendering uses WebGL or WebGPU. Mondo creators can freely choose JavaScript libraries such as Three.js or Babylon.js. 3D models, textures, and other assets are expected to use Web-oriented standard formats such as glTF.

Therefore, a Mondo is not world data centrally managed by Kemonet. It is an **independent web application that uses Kemonet's public APIs and protocols**.

### 3.2 Avataro

`Avataro` is a server that provides user information. It exists separately from a Mondo and serves as an Identity Provider (IdP) in OpenID Connect (OIDC).

A user stores the following information centrally with an Avataro or another trusted IdP:

- Account information
- Profile information
- Information identifying the user
- Avatar definition
- A URL referring to the avatar's 3D model

When a user visits a Mondo, the Mondo redirects the user to the IdP according to OIDC. After successful authentication, the IdP issues an ID token to the Mondo to prove the user's identity. The Mondo does not handle the user's password and identifies the user from the issued token.

The concrete 3D avatar model is specified by a URL provided by the IdP. The URL points to an avatar file in a standardized format such as VRM. The Mondo loads the model from that URL and displays it in the scene.

This allows a user to own one avatar and use the same avatar across multiple Mondos. Separating the Mondo operator from the entity managing user information is essential to the concept.

### 3.3 Simultaneity

`Simultaneity` is the mechanism for synchronizing actions and state between users in the same Mondo.

Because a Mondo is an independent website, the platform does not need to impose one communication method for all avatar interactions. Each Mondo is expected to establish a peer-to-peer (P2P) communication channel between browsers using WebRTC.

The main uses are:

- `RTCDataChannel` for frequently updated state such as position, rotation, and animation
- `MediaStream` for low-latency voice communication
- WebSocket or similar technology for signaling

Establishing a WebRTC connection requires signaling to exchange information about the peers. For this purpose, each Mondo provides a lightweight signaling server. The signaling server introduces users to one another, while users exchange high-frequency synchronization data directly whenever possible.

Depending on the number of participants and the characteristics of a Mondo, a Mondo may instead choose another communication topology such as a P2P mesh or an SFU (Selective Forwarding Unit). Allowing Mondo creators to choose and optimize the communication method is a key difference from a centralized platform.

## 4. Role of standard technologies

The draft associates the following technologies with these roles:

| Technology | Intended role |
| --- | --- |
| HTTP(S) | Delivery of Mondos and web connections between Mondos |
| URLs and domains | Identification and referencing of Mondos, avatars, and assets |
| WebXR | VR and AR experiences in the browser |
| WebGL and WebGPU | Rendering 3D environments and objects |
| JavaScript | Mondo logic, interactions, and user interfaces |
| Three.js and Babylon.js | Examples of 3D implementation libraries that a Mondo may choose |
| glTF | Example of a standard 3D asset format |
| VRM | Example of a standard 3D avatar format |
| OpenID Connect | Delegated authentication and user identification between a Mondo and an IdP |
| OAuth 2.0 | Foundation for scopes, consent, and authorization |
| WebRTC | Real-time communication between users |
| RTCDataChannel | Exchange of state data |
| MediaStream | Voice and other media communication |
| WebSocket | Example technology for WebRTC signaling |
| TURN | Relaying WebRTC traffic and reducing IP address exposure |
| SFU | Example of a communication or media relay for larger or specialized sessions |
| ActivityPub | Candidate for future social graph and Mondo federation |

These are technology elements mentioned in the draft. They are not confirmed dependencies or implementation requirements for the current Kemonet repository.

## 5. Authentication and identity

The basic authentication policy is to delegate authentication to a trusted IdP so that a Mondo never directly handles the user's password.

The expected flow is:

1. The user accesses a Mondo.
2. The Mondo starts an OIDC authentication flow.
3. The user authenticates and provides consent on the trusted IdP's domain.
4. The IdP issues an ID token to the Mondo.
5. The Mondo verifies the token and identifies the user.
6. The Mondo obtains permitted avatar or profile information when necessary.
7. The Mondo loads a 3D model in a standard format from the avatar URL.

A Mondo requests only the information and permissions it needs through OIDC and OAuth 2.0 scopes and consent. The IdP passes only information the user has explicitly permitted.

Important properties of this design are:

- A separate account for every Mondo is not required
- Passwords are not sent to a Mondo
- The IdP and Mondo are separate administrative domains
- Users can choose who manages their authentication and shared information
- Users do not need to recreate an avatar for every Mondo

The draft does not define claims, scopes, token verification, or authorization and validation rules for avatar URLs. These require specification before implementation.

## 6. Real-time communication

The experience within one Mondo should provide low-latency interaction that feels as though participants occupy the same space. The draft uses WebRTC as the primary technology and distinguishes two kinds of communication.

### State data

Frequently updated data such as position, rotation, and animation is exchanged through `RTCDataChannel`. The concrete data model, update rate, interpolation, authority, conflict resolution, and reliability settings are expected to depend on the characteristics of each Mondo.

### Media

Low-latency voice communication and similar media use `MediaStream`. A Mondo may choose P2P for small sessions or an SFU for larger or more demanding sessions.

### Signaling

Establishing WebRTC connections requires signaling to exchange information such as SDP and ICE candidates. The draft assumes that each Mondo may provide a lightweight signaling server using WebSocket or a similar technology.

The signaling server mediates connection establishment, but the design does not require all synchronization data to be centralized. This allows each Mondo to design its communication method around its participant count and application rules.

## 7. Security and privacy

The overall security policy follows a zero-trust approach in which each Mondo is treated as an **untrusted third party**. Kemonet does not make every Mondo trusted. Instead, it relies on boundaries provided by browsers and standard protocols.

### Authentication and authorization

- OIDC delegates protection against impersonation and phishing to the IdP's authentication infrastructure
- A Mondo does not directly handle user passwords
- Users are identified through signed ID tokens
- OAuth 2.0 scopes and user consent limit the information that is shared
- A Mondo explicitly requests the permissions it needs

### Communication

- TURN can reduce IP address exposure in WebRTC P2P communication
- Relaying through TURN reduces the ability of a peer to infer another peer's IP address and location
- WebRTC communication is encrypted with DTLS-SRTP

### Browser boundaries

- Origin isolation limits data access between Mondos
- Browser sandboxing limits access to the operating system, including the file system
- Browser access to operating-system resources is generally prohibited unless accompanied by an explicit user action

Together, these mechanisms fundamentally limit attacks in which a malicious script crosses the Mondo boundary and affects another website or the user's system.

However, browser security boundaries do not make Mondo content or external avatars automatically trustworthy. Countermeasures for malicious Mondos, malicious avatar URLs, impersonated IdPs, and excessive permission requests require further specification, implementation, and operational design.

## 8. Responsibilities of Kemonet and a Mondo

### General functions that Kemonet may provide

Kemonet should provide common infrastructure that independent Mondos can reuse, rather than features tailored to one demo or one Mondo.

Candidates derived from the draft include:

- OIDC and OAuth 2.0 specifications or APIs for connecting a Mondo and an IdP
- Specifications or APIs for obtaining avatar information from an Avataro
- Standard data models for avatars and user identity information
- Common protocols for real-time communication and synchronization within a Mondo
- A common specification or implementation for WebRTC signaling
- General mechanisms for integrating TURN and SFU services
- A standardized method for discovering and referencing Mondos and avatars
- Infrastructure for future integration with ActivityPub and similar protocols

These are candidates, not a requirement that everything be centralized in one Kemonet server. Kemonet APIs and libraries must be usable by independent implementations and operators.

### Responsibilities of a Mondo

A Mondo uses common Kemonet functionality while managing the parts required for its own experience and operation.

- 3D environments and content
- Rendering engines and JavaScript libraries
- User interfaces and interactions
- Game rules and application logic
- State data formats and synchronization strategies
- Choice of P2P, mesh, SFU, or other communication methods
- Operation of a signaling server when a shared service is not used
- Mondo-specific permissions, moderation, and stored data

Kemonet should not impose unnecessary constraints that prevent a Mondo from being implemented freely. Conversely, Mondo-specific user interfaces and game logic should not be moved into Kemonet's general-purpose APIs.

## 9. Position of kemonet-about

`kemonet-about` is a demo page that uses Kemonet to explain Kemonet itself. It should be treated as a Kemonet user and as one possible external Mondo implementation.

- Kemonet must build, test, and operate independently of `kemonet-about`
- `kemonet-about` should use Kemonet's public APIs as a general rule
- `kemonet-about` must not directly reference Kemonet's internal implementation or private modules
- Demo-specific presentation, content, and requirements must not be added to Kemonet as general functionality
- When an implementation reveals a missing capability, first determine whether it is a reusable Kemonet feature before adding a workaround to the demo

Maintaining this boundary allows Kemonet to develop as an independent platform that does not depend on a particular demo.

## 10. Matters requiring future specification

The draft describes a direction, not a complete implementation specification. The following are unresolved. Details should not be treated as settled requirements merely because they are convenient for an implementation; they require separate design and agreement where necessary.

- OIDC client registration and authentication flows between a Mondo and an Avataro or IdP
- ID token verification, required claims, issuer handling, and audience handling
- The format of user identifiers and the handling of identifiers across IdPs
- Claims, scopes, and consent screens for profile and avatar information
- Ownership, availability, updates, deletion, caching, and validation of avatar URLs
- Required features and compatibility expectations for VRM and other avatar formats
- Data models for position, rotation, animation, and other state exchanged within a Mondo
- Authority, reliability, update rates, interpolation, and conflict resolution for synchronized state
- Message formats and authentication for WebRTC signaling
- Selection criteria and fallback behavior for P2P, mesh, SFU, and TURN
- Standardization of Mondo discovery, search, links, and metadata
- Movement between Mondos, transfer of user state, and cross-Mondo interaction
- Scope and target objects of ActivityPub integration
- Countermeasures for malicious Mondos, Avataros, IdPs, and assets
- Participant moderation, reporting, blocking, leaving, and access control
- Observability, failure behavior, availability, and scaling
- Support for environments without WebXR and for low-performance devices

## 11. Implementation principles

Future Kemonet implementation should preserve the following principles.

1. **Design as an extension of the Web**

   Prefer URLs, HTTP(S), browser APIs, and standard protocols rather than assuming a dedicated client or a single service.

2. **Preserve federation**

   Do not unconditionally centralize Mondos or Avataros in a Kemonet database. Assume independent operators and interoperability.

3. **Separate public APIs from internal implementation**

   Define APIs for Mondo authors clearly enough that they can accomplish their goals without depending on private modules.

4. **Separate general functions from demo-specific functions**

   Add to Kemonet only functions that can be reused by multiple Mondos. Keep work-specific presentation and requirements in the consuming project.

5. **Preserve user agency**

   Do not make a user's identity, avatar, consent, or shared information depend on the convenience of one Mondo.

6. **Make trust boundaries explicit**

   Do not treat Mondos, Avataros, IdPs, signaling servers, and TURN or SFU services as one trusted entity. Apply authentication, authorization, and input validation at each boundary.

7. **Do not confuse the draft with a finalized specification**

   Do not turn details absent from the draft into de facto requirements merely because they are convenient for implementation. Record and evaluate them as design decisions.

## 12. Current repository note

The current Kemonet repository is a framework-agnostic TypeScript library scaffold. The presence of this document does not mean that the domain APIs for Mondo, Avataro, Simultaneity, OIDC, or WebRTC have already been implemented.

This document exists to carry forward an understanding of the concept. When adding concrete APIs, protocols, data models, dependencies, or server components, inspect the current public API and its consumers first. Design each addition as a general Kemonet capability that can stand on its own without `kemonet-about`.

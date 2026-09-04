# kemonet

Framework-agnostic TypeScript library for the kemonet platform.

The package has no React or Vite runtime dependency. Framework integrations belong in separate adapter packages and must consume the public `kemonet` API.

## Development

```sh
npm install
npm run check
npm run build
npm run mutation
```

The repository is currently an implementation-independent TypeScript scaffold. Domain APIs and tests will be added in later changes.

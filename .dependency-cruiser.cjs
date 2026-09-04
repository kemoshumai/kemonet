module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true }
    },
    {
      name: "no-react-runtime-dependency",
      severity: "error",
      from: { path: "^src" },
      to: { path: "react" }
    },
    {
      name: "core-does-not-import-browser",
      severity: "error",
      from: { path: "^src/core" },
      to: { path: "^src/browser" }
    }
  ],
  options: {
    tsPreCompilationDeps: true,
    doNotFollow: { path: "node_modules" },
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".mjs"]
    }
  }
};

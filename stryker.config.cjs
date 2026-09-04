module.exports = {
  mutate: ["src/**/*.ts"],
  testRunner: "vitest",
  testRunner_comment: "Tests are provided by Vitest",
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.build.json",
  reporters: ["clear-text", "html"],
  coverageAnalysis: "perTest"
};

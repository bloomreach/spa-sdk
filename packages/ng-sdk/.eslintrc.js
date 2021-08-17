module.exports = {
  extends: [
    "@bloomreach/eslint-config-angular"
  ],
  parserOptions: {
    project: [
      "tsconfig.json",
      "tsconfig.spec.json",
    ],
    tsconfigRootDir: __dirname,
    createDefaultProgram: true
  }
}

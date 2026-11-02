module.exports = {
  // Build a self-contained server with only the files it needs at runtime, for a small Docker image.
  output: 'standalone',
  // sharp is only for next/image, which the site doesn't use.
  outputFileTracingExcludes: {
    '*': ['node_modules/sharp/**', 'node_modules/@img/**'],
  },
};

const { createWebConfig } = require('./web-config')
const { createNodeConfig } = require('./node-config')

module.exports = {
  createMultiConfig
}

function createMultiConfig({
  isProduction,
  context,
  configEnv,
  publicPath,
  outputPath,
  compatibility,
  webEntry,
  webProfile = false,
  nodeEntry,
  loadParts,
  bundleIsDev,
}) {
  return [
    createWebConfig({
      isProduction,
      context,
      configEnv,
      publicPath,
      outputPath,
      compatibility,
      entry: webEntry,
      profile: webProfile,
      loadParts,
      bundleIsDev,
    }),
    createNodeConfig({
      isProduction,
      context,
      configEnv,
      outputPath,
      compatibility,
      entry: nodeEntry,
      loadParts,
      bundleIsDev,
    })
  ]
}

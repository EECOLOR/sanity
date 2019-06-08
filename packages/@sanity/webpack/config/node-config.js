const { DefinePlugin } = require('webpack')
const createJsConfig = require('./js')
const nodeExternals = require('webpack-node-externals')
const ConfigResolverPlugin = require('../plugins/ConfigResolverPlugin')
const DebugResolverPlugin = require('../plugins/DebugResolverPlugin')
const PartsPlugin = require('../plugins/PartsPlugin')
const VersionResolverPlugin = require('../plugins/VersionResolverPlugin')

module.exports = {
  createNodeConfig
}

function createNodeConfig({
  isProduction,
  context,
  configEnv,
  outputPath,
  compatibility,
  entry,
  loadParts,
}) {
  const { optional_allowEsModule, all_onlyDefaultWhenEsModule } = compatibility

  const js = createJsConfig()

  return {
    name: 'node',
    mode: isProduction ? 'production' : 'development',
    target: 'node',
    context,
    externals: [nodeExternals()],
    entry,
    output: {
      filename: '[name].js',
      path: outputPath,
      libraryTarget: 'commonjs'
    },
    module: { rules: js.loaders },
    plugins: [
      PartsPlugin({ loadParts, optional_allowEsModule, all_onlyDefaultWhenEsModule }),
      ConfigResolverPlugin({ configEnv }),
      VersionResolverPlugin(),
      DebugResolverPlugin(),
      new DefinePlugin({ SANITY_PARTS_COMPATIBILITY: JSON.stringify(compatibility) }),
    ]
  }
}

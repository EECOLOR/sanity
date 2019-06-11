const { createAlias } = require('./alias')
const { createJsConfig } = require('./js')
const { DefinePlugin, ContextReplacementPlugin, optimize } = require('webpack')
// const nodeExternals = require('webpack-node-externals')
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
  bundleIsDev,
}) {
  const { optional_allowEsModule, all_onlyDefaultWhenEsModule } = compatibility

  const js = createJsConfig({ isProduction })
  const alias = createAlias({ context })

  return {
    name: 'node',
    mode: isProduction ? 'production' : 'development',
    target: 'node',
    context,
    // TODO: externals (tricky with lerna)
    entry,
    output: {
      filename: '[name].js',
      path: outputPath,
      libraryTarget: 'commonjs'
    },
    resolve: { alias },
    module: { rules: [{ oneOf: js.loaders }] },
    plugins: [
      PartsPlugin({ loadParts, optional_allowEsModule, all_onlyDefaultWhenEsModule }),
      ConfigResolverPlugin({ configEnv }),
      VersionResolverPlugin(),
      DebugResolverPlugin(),
      new DefinePlugin({
        SANITY_PARTS_COMPATIBILITY: JSON.stringify(compatibility),
        __DEV__: bundleIsDev,
        'process.env.NODE_ENV': isProduction ? 'production': process.env.NODE_ENV,
      }),
      new ContextReplacementPlugin(/moment[/\\]locale$/, /en|nb/),
      new optimize.ModuleConcatenationPlugin(),
    ]
  }
}

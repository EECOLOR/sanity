const { createAlias } = require('./alias')
const { createCssConfig } = require('./css')
const { createJsConfig } = require('./js')
const { HotModuleReplacementPlugin, DefinePlugin, ContextReplacementPlugin, optimize } = require('webpack')
const ConfigResolverPlugin = require('../plugins/ConfigResolverPlugin')
const DebugResolverPlugin = require('../plugins/DebugResolverPlugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const PartsPlugin = require('../plugins/PartsPlugin')
const TerserPlugin = require('terser-webpack-plugin')
const VersionResolverPlugin = require('../plugins/VersionResolverPlugin')

module.exports = {
  createWebConfig,
  createModuleAndPlugins,
}

function createWebConfig({
  isProduction,
  context,
  configEnv,
  publicPath,
  outputPath,
  compatibility,
  entry,
  loadParts,
  bundleIsDev,
  profile = false,
}) {
  return {
    name: 'web',
    mode: isProduction ? 'production' : 'development',
    target: 'web',
    context,
    entry,
    output: {
      publicPath,
      filename: '[name].[hash].js',
      path: outputPath
    },
    profile,
    resolve: { alias: createAlias({ context }) },
    optimization: {
      namedChunks: false,
      runtimeChunk: 'single',
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: true
        }),
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            preset: ['default', { cssDeclarationSorter: false }],
          }
        }),
      ],
      splitChunks: {
        chunks: 'all',
        minSize: 10000,
      }
    },
    ...createModuleAndPlugins({ loadParts, compatibility, isProduction, configEnv, bundleIsDev }),
  }
}

function createModuleAndPlugins({ loadParts, compatibility, isProduction, configEnv, bundleIsDev }) {

  const { optional_allowEsModule, all_onlyDefaultWhenEsModule } = compatibility
  const css = createCssConfig({ isProduction })
  const js = createJsConfig({ isProduction })

  return {
    module: { rules: [{ oneOf: [
      { test: /\.json$/, type: 'json' },
      ...js.loaders,
      ...css.loaders,
      { loader: 'file-loader' }
    ]}]},
    plugins: [
      PartsPlugin({ loadParts, optional_allowEsModule, all_onlyDefaultWhenEsModule }),
      ConfigResolverPlugin({ configEnv }),
      VersionResolverPlugin(),
      DebugResolverPlugin(),
      ...css.plugins,
      !isProduction && new HotModuleReplacementPlugin(),
      new DefinePlugin({
        PARTS_COMPATIBILITY: JSON.stringify(compatibility),
        __DEV__: bundleIsDev,
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production': process.env.NODE_ENV),
      }),
      new ContextReplacementPlugin(/moment[/\\]locale$/, /en|nb/),
      new optimize.ModuleConcatenationPlugin(),
    ].filter(Boolean),
  }
}

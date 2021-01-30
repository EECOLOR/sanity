const { provideCompilationParam } = require('../plugins/utils')
const ExtractCssChunks = require('mini-css-extract-plugin')
const PartsPlugin = require('../plugins/PartsPlugin')

const pluginName = 'PostCssPluginsProvider'
const pluginsParamName = `${pluginName} - plugins`

module.exports = { createCssConfig }

function createCssConfig({ isProduction }) {
  return {
    loaders: [
      {
        test: /\.css\?/,
        exclude: /node_modules/,
        resourceQuery: /raw/,
        use: 'file-loader',
      },
      {
        resource: {
          and: [
            { test: /\.css(\?|$)/ },
            {
              or: [
                { exclude: /node_modules/ }, // TODO: DISCUSS packages@sanity is only save if they are compiled using the same webpack config
                { include: /(@sanity\/|sanity-plugin)/ },
              ]
            }
          ]
        },
        use: [
          { loader: ExtractCssChunks.loader, options: { hmr: !isProduction } },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
              localIdentName: isProduction ? '[hash:base64]' : '[folder]-[name]-[local]__[hash:base64:5]',
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              config: { path: __dirname },
              sourceMap: true,
              plugins: loaderContext => loaderContext[pluginsParamName],
           }
          }
        ]
      },
      {
        test: /\.css$/,
        use: 'file-loader',
      },
    ],
    plugins: [
      PostCssPluginsProvider(),
      new ExtractCssChunks({
        filename: isProduction ? '[name].[hash].css' : '[name].css' // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/391
      }),
    ]
  }
}

function PostCssPluginsProvider() {
  return {
    apply: compiler => {
      provideCompilationParam({
        compiler,
        pluginName,
        paramName: pluginsParamName,
        getParamValue: getPlugins,
        stage: PartsPlugin.resolveParamStage + 1,
      })

      compiler.hooks.compilation.tap(pluginName, addPluginsToLoaderContext)

      function addPluginsToLoaderContext(compilation, params) {
        // this plugin will be moved in webpack v5 (while the documentation states it will be removed...) -> https://github.com/webpack/webpack.js.org/pull/2988
        compilation.hooks.normalModuleLoader.tap(pluginName, (loaderContext, module) => {
          loaderContext[pluginsParamName] = params[pluginsParamName]
        })
      }

      function getPlugins(params) {
        const resolve = params[PartsPlugin.resolveParamName]
        return [
          require('postcss-import')({
            resolve: (file, context) => resolve(context, file),
            load: file => new Promise((resolve, reject) => {
              compiler.inputFileSystem.readFile(file, (e, x) => e ? reject(e) : resolve(x.toString('utf-8')))
            }),
          }),
          require('../postcss-plugins/css-compatibility')(),
          require('postcss-preset-env')({
            features: {
              'color-mod-function': true,
              'custom-properties': { preserve: false },
              'custom-media-queries': { preserve: false },
              'media-query-ranges': true,
              'custom-selectors': true,
              'nesting-rules': true,
              'color-functional-notation': true,
              'font-variant-property': true,
              'all-property': true,
              'any-link-pseudo-class': true,
              'matches-pseudo-class': true,
              'not-pseudo-class': true,
              'overflow-wrap-property': true,
            },
          })
       ]
      }
    }
  }
}

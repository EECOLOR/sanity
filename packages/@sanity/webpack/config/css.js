const ExtractCssChunks = require('mini-css-extract-plugin')
const PartsPlugin = require('../plugins/PartsPlugin')

let cachedPlugins

const name = 'CSS plugin'
module.exports = { createCssConfig }
let variablesCache
let mediaCache
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
            options: { modules: true, sourceMap: true, importLoaders: 1 }
          },
          {
            loader: 'postcss-loader',
            options: {
              config: { path: __dirname },
              sourceMap: true,
              plugins: loaderContext => loaderContext.postCssPlugins
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
      new ExtractCssChunks({
        filename: isProduction ? '[name].[hash].css' : '[name].css' // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/391
      }),
      {
        apply: compiler => {
          compiler.hooks.compilation.tap(name, compilation)
          function compilation(compilation, { normalModuleFactory, [PartsPlugin.partsParamName]: parts }) {

// use the same technique as with parts to provide it to child contexts
console.log('new compilation')
            const resolver = compilation.resolverFactory.get("normal", {})

            function getResolve(loadrContext) {
              const resolve = (context, request) => new Promise((resolve, reject) => {
                resolver.resolve({}, context, request, {}, (e, x) => e ? reject(e) : resolve(x))
              })
              const getInfo = request => PartsPlugin.getPartsResourceInfo(request, parts)

              return async (context, file) => {
                const { isSinglePartRequest, getRequestWithImplementation } = getInfo(file) || {}
                const request = isSinglePartRequest ? getRequestWithImplementation() : file
                return resolve(context, request)
              }
            }
            const resolve = getResolve()
            const variables = [
              'part:@sanity/base/theme/variables-style',
              'part:@sanity/base/theme/responsive-style',
              'part:@sanity/base/theme/variables/brand-colors-style',
              'part:@sanity/base/theme/variables/code-style',
              'part:@sanity/base/theme/variables/forms-style',
              'part:@sanity/base/theme/variables/globals-style',
              'part:@sanity/base/theme/variables/gray-colors-style',
              'part:@sanity/base/theme/variables/layers-style',
              'part:@sanity/base/theme/variables/list-style',
              'part:@sanity/base/theme/variables/progress-style',
              'part:@sanity/base/theme/variables/selectable-item-style',
              'part:@sanity/base/theme/variables/state-colors-style',
              'part:@sanity/base/theme/variables/typography-style',
              'part:@sanity/base/theme/variables/override-style',
            ]
            const resolvedVariables = variablesCache || (console.log('resolving variables'), variablesCache = Promise.all(variables.map(x => resolve('???', x))))
            const resolvedMedia = mediaCache || (mediaCache = Promise.all([
              resolve('???', 'part:@sanity/base/theme/responsive-style'),
            ]))
            const plugins = cachedPlugins || (cachedPlugins = [
              require('../postcss-plugins/css-tweaks')({ removeImports: variables }),
              require('postcss-import')({
                resolve: (file, context) => resolve(context, file),
                load: file => new Promise((resolve, reject) => {
                  compilation.inputFileSystem.readFile(file, (e, x) => e ? reject(e) : resolve(x.toString('utf-8')))
                }),
              }),
              require('postcss-preset-env')({
                features: {
                  // 'environment-variables': true,
                  'color-mod-function': true,
                  'custom-properties': {
                    preserve: false,
                    importFrom: resolvedVariables,
                  },
                  'custom-media-queries': {
                    importFrom: resolvedMedia,
                  },
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
           ])

            compilation.hooks.normalModuleLoader.tap(name, (loaderContext, module) => {
              loaderContext.postCssPlugins = plugins
            })
          }

        }
      }
    ]
  }
}

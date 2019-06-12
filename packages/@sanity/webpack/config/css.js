const ExtractCssChunks = require('mini-css-extract-plugin')
const PartsPlugin = require('../plugins/PartsPlugin')


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
            options: { modules: true, sourceMap: true, importLoaders: 1 }
          },
          {
            loader: 'postcss-loader',
            options: {
              config: { path: __dirname },
              sourceMap: true,
              plugins: loaderContext => {
                const resolve = PartsPlugin.getResolve(loaderContext)
                return [
                  require('postcss-import')({
                    resolve: (file, context) => resolve(context, file),
                    load: file => new Promise((resolve, reject) => {
                      loaderContext.fs.readFile(file, (e, x) => e ? reject(e) : resolve(x.toString('utf-8')))
                    }),
                  }),
                  require('../postcss-plugins/css-tweaks')(),
                  require('postcss-preset-env')({
                    features: {
                      'color-mod-function': true,
                      'custom-properties': { preserve: false },
                      'custom-media-queries': true,
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
    ]
  }
}

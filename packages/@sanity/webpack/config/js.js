module.exports = { createJsConfig }

function createJsConfig({ isProduction }) {
  return {
    loaders: [
      {
        resource: {
          and: [
            { test: /\.js$/ },
            {
              or: [
                { exclude: /(packages\/@sanity|node_modules)/ }, // TODO: DISCUSS packages@sanity is only save if they are compiled using the same webpack config
                { include: /(packages\/@sanity\/webpack)/ },
              ]
            }
          ]
        },
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false, // this needs to be false, any other value will cause .babelrc to interfere with these settings
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
              ],
              plugins: [
                'lodash',
                '@babel/plugin-proposal-class-properties',
                !isProduction && 'react-hot-loader/babel',
              ].filter(Boolean),
              cacheDirectory: true,
            },
          }
        ]
      },
      { test: /\.js$/ }
    ]
  }
}

const { createMultiConfig } = require('../config/multi-config')
const express = require('express')
const importFresh = require('import-fresh')
const path = require('path')
const webpack = require('webpack')

// This is a conscious choice over webpack-dev-server, ask me if you want to know (I hope I will still remember, haha)
const createWebpackHotMiddleware = require('webpack-hot-middleware')
const createWebpackDevMiddleware = require('webpack-dev-middleware')

module.exports = { createDevServer }

function createDevServer({
  isProduction,
  context,
  configEnv,
  publicPath,
  outputPath,
  compatibility,
  loadParts,
  bundleIsDev,
}) {
  if (isProduction) throw new Error('The dev server is not ready for production mode')

  const hotReloadEventPath = `${publicPath}__webpack_hmr`
  const hotReloadClient = `webpack-hot-middleware/client?path=${hotReloadEventPath}`

  const multiConfig = createMultiConfig({
    isProduction,
    context,
    configEnv,
    publicPath,
    outputPath,
    compatibility,
    loadParts,
    bundleIsDev,
    webEntry: {
      client: [
        'normalize.css',
        !isProduction && 'react-hot-loader/patch',
        require.resolve(`../browser/entry${isProduction ? '' : '-dev'}.js`),
        !isProduction && hotReloadClient,
      ].filter(Boolean)
    },
    nodeEntry: { ['createIndexHtml']: require.resolve('./createIndexHtml.js') },
  })

  const multiCompiler = webpack(multiConfig)
  const clientCompiler = multiCompiler.compilers.find(x => x.name === 'web')
  const webpackDevMiddleware = !isProduction && createWebpackDevMiddleware(
    multiCompiler,
    {
      publicPath,
      writeToDisk: file => ['createIndexHtml.js'].includes(path.basename(file)),
      index: false,
      serverSideRender: true,
      stats: {
        colors: true,
        children: {
          children: false
        }
      },
    }
  )
  const webpackHotMiddleware = !isProduction && createWebpackHotMiddleware(
    clientCompiler,
    {
      path: hotReloadEventPath,
    }
  )

  const staticPath = `${publicPath}static/`

  const app = express()
  app.use(staticPath, express.static(path.resolve(context, 'static')))
  webpackDevMiddleware && app.use(webpackDevMiddleware)
  webpackHotMiddleware && app.use(webpackHotMiddleware)
  app.get(`*`, (req, res) => {
    if (req.path.startsWith(publicPath)) {
      if (
        req.path.endsWith('hot-update.json') ||
        req.path.startsWith(staticPath)
      ) res.status(404).send()
      else {
        const { webpackStats: stats } = res.locals
        const webStats = stats.toJson({ all: false, assets: true, publicPath: true }).children.find(x => x.name === 'web')
        const { createIndexHtml } = importFresh(path.resolve(outputPath, 'createIndexHtml.js'))
        res.status(200).send(createIndexHtml(webStats))
      }
    } else res.status(404).send(`Sanity - Nothing served outside of the public path ('${publicPath}')`)
  })

  // Expose webpack compiler on server instance
  app.locals.compiler = multiCompiler

  return app
}

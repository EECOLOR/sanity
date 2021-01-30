// maybe this file should be placed somewhere else

const path = require('path')
const importFresh = require('import-fresh')
const resolver = require('@sanity/resolver')

const { SANITY_ENV, STUDIO_BASEPATH, BUNDLE_ENV = 'development' } = process.env

module.exports = {
  getConfigDefaults,
  getEntryDefaults,
}

function getConfigDefaults({ isProduction, outputPath = undefined }) {
  // TODO: DISCUSS
  // this is not entirely compatible, in the original version the base path and context were mixed
  // where we now make a distinction between context and public path
  const context = process.cwd()
  outputPath = outputPath || path.resolve(context, 'dist')

  const sanityJson = importFresh(require.resolve('sanity.json', { paths: [context] }))
  const { project: { basePath = '/' } = {} } = sanityJson

  // TODO: DISCUSS
  // copied from webpack-loader/partLoader, similar code is in plugin-loader/loader, that version
  // (if used for reduceConfig) however defaults to 'development' (default value in reduceConfig)
  // instead of 'production'
  //
  // Another problem here is that this switches two parts of the configuration:
  // - the api
  // - the env section of sanity.json
  //
  // It might be better to separate CONFIG_ENV (see @kaliber/config) and SANITY_ENV
  const configEnv = SANITY_ENV || (isProduction ? 'production' : process.env.NODE_ENV)

  return {
    isProduction,
    context,
    outputPath,
    // TODO: DISCUSS
    // originaly some assets were given a /static public path, now everything lives in the same
    // directory
    publicPath: STUDIO_BASEPATH || basePath,
    configEnv,
    compatibility: {
      optional_allowEsModule: true,
      all_onlyDefaultWhenEsModule: true,
      ...sanityJson.compatibility,
    },
    async loadParts() {
      return resolver.resolveParts({
        basePath: context,
        env: configEnv,
        useCompiledPaths: isProduction
      })
    },
    bundleIsDev: !isProduction && (BUNDLE_ENV === 'development'),
  }
}

function getEntryDefaults({ isProduction }) {
  return {
    nodeEntry: { ['createIndexHtml']: require.resolve('../server/createIndexHtml.js') },
    webEntry: {
      client: [
        'normalize.css',
        require.resolve(`../browser/entry${isProduction ? '' : '-dev'}.js`),
      ]
    }
  }
}

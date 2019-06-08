const { reduceConfig } = require('@sanity/util')
const { resolveWithoutFile } = require('./utils')
const importFresh = require('import-fresh')
const path = require('path')

const name = 'ConfigResolverPlugin'

module.exports = ConfigResolverPlugin

function ConfigResolverPlugin({ configEnv }) {
  return {
    apply: compiler => {
      compiler.hooks.compilation.tap(name, compilation)

      function compilation(compilation, { normalModuleFactory }) {
        addConfigResolver(normalModuleFactory, compiler.context, configEnv)
      }
    }
  }
}

function addConfigResolver(normalModuleFactory, context, configEnv) {
  const configRegExp = /^config:(.+)$/
  const configContext = path.join(context, 'config')

  resolveWithoutFile({
    name,
    normalModuleFactory,
    getRequestData: request => request.match(configRegExp),
    createLoader: ([, configRequest]) => {
      const rawConfig = importFresh(
        configRequest === 'sanity'
          ? path.join(context, 'sanity.json')
          : path.join(configContext, `${configRequest}.json`)
      )
      const config = reduceConfig(rawConfig, configEnv)
      return {
        loader: require.resolve('../loaders/object-loader'),
        options: { object: config },
      }
    }
  })
}

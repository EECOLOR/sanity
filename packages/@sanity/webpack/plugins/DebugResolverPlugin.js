const { partsParamName } = require('./PartsProviderPlugin')
const { resolveWithoutFile } = require('./utils')

const name = 'DebugResolverPlugin'

module.exports = DebugResolverPlugin

function DebugResolverPlugin() {
  return {
    apply: compiler => {
      compiler.hooks.compilation.tap(name, compilation)

      function compilation(compilation, { normalModuleFactory, [partsParamName]: parts }) {
        addDebugResolver(normalModuleFactory, parts)
      }
    }
  }
}

function addDebugResolver(normalModuleFactory, parts) {
  resolveWithoutFile({
    name,
    normalModuleFactory,
    getRequestData: request => request === 'sanity:debug',
    createLoader: _ => ({
      loader: require.resolve('../loaders/object-loader'),
      options: { object: { ...parts /* TODO: DISCUSS - debug used to add the basePath */ } },
    })
  })
}

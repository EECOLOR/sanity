const { getSanityVersions } = require('@sanity/util')
const { resolveWithoutFile } = require('./utils')

const name = 'VersionResolverPlugin'

module.exports = VersionResolverPlugin

function VersionResolverPlugin() {
  return {
    apply: compiler => {
      compiler.hooks.compilation.tap(name, compilation)

      function compilation(compilation, { normalModuleFactory }) {
        addVersionsResolver(normalModuleFactory, compiler.context)
      }
    }
  }
}

function addVersionsResolver(normalModuleFactory, context) {
  resolveWithoutFile({
    name,
    normalModuleFactory,
    getRequestData: request => request === 'sanity:versions',
    createLoader: _ => ({
      loader: require.resolve('../loaders/object-loader'),
      options: { object: getSanityVersions(context) },
    }),
  })
}

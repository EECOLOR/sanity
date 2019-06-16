const PartsProviderPlugin = require('./PartsProviderPlugin')
const PartsResolverPlugin = require('./PartsResolverPlugin')

PartsPlugin.getResolve = PartsResolverPlugin.getResolve
PartsPlugin.partsParamName = PartsProviderPlugin.partsParamName
PartsPlugin.getPartsResourceInfo = PartsResolverPlugin.getPartsResourceInfo
module.exports = PartsPlugin


function PartsPlugin({
  loadParts,
  optional_allowEsModule, // see part-loader for details
  all_onlyDefaultWhenEsModule,
}) {
  return {
    apply: compiler => {
      [
        PartsProviderPlugin({ loadParts }),
        PartsResolverPlugin({ optional_allowEsModule, all_onlyDefaultWhenEsModule }), // see part-loader for details
      ].filter(Boolean).forEach(x => { x.apply(compiler) })
    }
  }
}

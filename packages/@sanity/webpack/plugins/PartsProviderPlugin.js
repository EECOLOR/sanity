/**
 * Provides parts for other plugins.
 *
 * Use the exported `partsParamName` to access the param in the compilation params.
 */
const { provideCompilationParam } = require('./utils')

const name = 'PartsProviderPlugin'
const partsParamName = `${name} - parts`
const partsParamStage = 0

PartsProviderPlugin.partsParamName = partsParamName
PartsProviderPlugin.partsParamStage = partsParamStage
module.exports = PartsProviderPlugin

function PartsProviderPlugin({ loadParts }) {
  return {
    apply: compiler => {
      provideCompilationParam({
        compiler,
        pluginName: name,
        paramName: partsParamName,
        getParamValue: loadParts,
        stage: partsParamStage,
      })
    }
  }
}

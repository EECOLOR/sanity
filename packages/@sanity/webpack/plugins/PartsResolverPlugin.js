const { partsParamName, partsParamStage } = require('./PartsProviderPlugin')
const { resolveWithoutFile, provideCompilationParam } = require('./utils')

const name = 'PartsResolverPlugin'
const resolveParamName = `${name} - resolve`
const resolveParamStage = partsParamStage + 1

PartsResolverPlugin.resolveParamName = resolveParamName
PartsResolverPlugin.resolveParamStage = resolveParamStage
module.exports = PartsResolverPlugin

function PartsResolverPlugin({
  optional_allowEsModule, // see part-loader for details
  all_onlyDefaultWhenEsModule,
}) {
  return {
    apply: compiler => {
      provideCompilationParam({
        compiler,
        pluginName: name,
        paramName: resolveParamName,
        getParamValue: params => createResolve(compiler, params[partsParamName]),
        stage: resolveParamStage,
      })
      compiler.hooks.compilation.tap(name, compilation)

      function compilation(compilation, { normalModuleFactory, [partsParamName]: parts }) {
        addPartsResolver(normalModuleFactory, parts, optional_allowEsModule, all_onlyDefaultWhenEsModule)
      }
    }
  }
}

function addPartsResolver(normalModuleFactory, parts, optional_allowEsModule, all_onlyDefaultWhenEsModule) {
  resolveWithoutFile({
    name,
    normalModuleFactory,
    getRequestData: request => getPartsResourceInfo(request, parts),
    getNewRequest: x =>
      (
        x.isSinglePartRequest ||
        (optional_allowEsModule && x.isOptionalPartRequest && x.hasImplementation)
      ) &&
      x.getRequestWithImplementation(),
    createLoader: partsResourceInfo => ({
      loader: require.resolve('../loaders/part-loader'),
      options: { partsResourceInfo, all_onlyDefaultWhenEsModule, optional_allowEsModule },
    })
  })
}

function createResolve(compiler, parts) {
  const resolver = compiler.resolverFactory.get("normal", {})
  const resolve = (context, request) => new Promise((resolve, reject) => {
    resolver.resolve({}, context, request, {}, (e, x) => e ? reject(e) : resolve(x))
  })

  return async (context, request) => {
    const { isSinglePartRequest, getRequestWithImplementation } = getPartsResourceInfo(request, parts) || {}
    const newRequest = isSinglePartRequest ? getRequestWithImplementation() : request
    return resolve(context, newRequest)
  }
}

// this could use some form of caching
function getPartsResourceInfo(request, parts) {
  const [resource] = request.split('!').slice(-1)
  const isPart = resource.startsWith('part:') && resource
  const isOptionalPartRequest =
    (isPart && isPart.slice(-1) === '?' && isPart.slice(0, -1))// ||
    // (resource.startsWith('optional:part:') && resource.slice(9)) // I would prefer this style for various reasons
  const isSinglePartRequest = !isOptionalPartRequest && isPart
  const isAllPartsRequest = resource.startsWith('all:part:') && resource.slice(4)

  const name = (isSinglePartRequest || isOptionalPartRequest || isAllPartsRequest)
  const part = name && {
    ...(parts.definitions[name] || throwError(`No part declared with the name '${name}' ('${request}')`)),
    implementations: parts.implementations[name] || [],
  }
  const hasImplementation = part && part.implementations.length
  return name &&
    {
      isSinglePartRequest,
      isOptionalPartRequest,
      isAllPartsRequest,
      name,
      resource,
      part,
      hasImplementation,
      getRequestWithImplementation: () => {
        if (!hasImplementation) throwError(`No implementations available for part '${name}'`)
        const [implementation] = part.implementations
        return request.replace(resource, implementation.path)
      }
    }
}

function throwError(message) { throw new Error(message) }

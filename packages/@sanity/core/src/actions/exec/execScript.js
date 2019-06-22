const spawn = require('child_process').spawn
const path = require('path')
const fse = require('fs-extra')
const { webpack, getConfigDefaults, createNodeConfig } = require('@sanity/webpack')

module.exports = async args => {
  // In case of specifying --with-user-token <file.js>, use the "token" as the script
  const script = args.argsWithoutOptions[0] || args.extOptions['with-user-token']
  const withToken = Boolean(args.extOptions['with-user-token'])

  if (!script) {
    throw new Error('SCRIPT must be provided. `sanity exec <script>`')
  }

  const configDefaults = getConfigDefaults({ isProduction: false })
  const { context } = configDefaults
  const scriptPath = path.resolve(context, script)
  const outputPath = path.resolve(context, '.tmp')

  if (!(await fse.exists(scriptPath))) {
    throw new Error(`${scriptPath} does not exist`)
  }

  const nodeConfig = createNodeConfig({
    ...configDefaults,
    outputPath,
    entry: {
      ['index']: scriptPath,
      ...(withToken && { ['configClient']: require.resolve('./configClient') })
    },
  })

  webpack(
    nodeConfig,
    (e, stats) => {
      if (e) {
        console.error(e.stack || e)
        if (e.details) console.error(e.details)
        process.exit(1)
      }

      if (stats.hasErrors()) {
        console.log(stats.toString({ colors: true }))
        process.exit(1)
      }

      finishBuild()
        .then(_ => 0, e => (console.error(e), 1))
        .then(x => process.exit(x))
    }
  )

  async function finishBuild() {
    return new Promise((resolve) => {
      const nodeArgs = [
        ...(withToken ? ['-r', path.resolve(outputPath, 'configClient')] : []),
        path.resolve(outputPath, 'index'),
        ...(args.extraArguments || [])
      ]

      const proc = spawn(process.argv[0], nodeArgs, {stdio: 'inherit'})
      proc.on('close', resolve)
    })
  }
}

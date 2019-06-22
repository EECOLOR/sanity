import path from 'path'
import fse from 'fs-extra'
import rimTheRaf from 'rimraf'
import filesize from 'filesize'
import {promisify} from 'es6-promisify'
import { getConfigDefaults, createMultiConfig, webpack, getEntryDefaults } from '@sanity/webpack'
import sortModulesBySize from '../../stats/sortModulesBySize'
import checkReactCompatibility from '../../util/checkReactCompatibility'
import {tryInitializePluginConfigs} from '../config/reinitializePluginConfigs'
import importFresh from 'import-fresh'


const rimraf = promisify(rimTheRaf)
const absoluteMatch = /^https?:\/\//i

export default async (args, context) => {
  const overrides = args.overrides || {}
  const {output, prompt, workDir} = context
  const flags = Object.assign(
    {minify: true, profile: false, stats: false, 'source-maps': false},
    args.extOptions
  )

  const unattendedMode = flags.yes || flags.y

  const userOutputPath = args.argsWithoutOptions[0]
  const outputPath = userOutputPath && path.resolve(userOutputPath)
  const isProduction = process.env.NODE_ENV === 'production'

  const configDefaults = getConfigDefaults({ isProduction, outputPath })
  const multiConfig = createMultiConfig({
    ...configDefaults,
    ...getEntryDefaults({ isProduction }),
    webProfile: flags.profile,
  })
  const actualOutputPath = configDefaults.outputPath

  await tryInitializePluginConfigs({workDir, output})

  checkReactCompatibility(workDir)

  const compiler = webpack(multiConfig)
  const compile = promisify(compiler.run.bind(compiler))
  let shouldDelete = true

  if (!unattendedMode) {
    shouldDelete = await prompt.single({
      type: 'confirm',
      message: `Do you want to delete the existing directory (${actualOutputPath}) first?`,
      default: true
    })
  }

  let spin

  if (shouldDelete) {
    const deleteStart = Date.now()
    spin = output.spinner('Clearing output folder').start()
    await rimraf(actualOutputPath)
    spin.text = `Clearing output folder (${Date.now() - deleteStart}ms)`
    spin.succeed()
  }

  spin = output.spinner('Building Sanity').start()

  let bundle = {}

  try {
    // Compile the bundle
    const statistics = await compile()
    const stats = statistics.toJson({
      all: false,
      assets: true,
      publicPath: true,
      errors: true,
      modules: flags.stats,
      warnings: true,
      children: {
        children: false,
      },
      timings: true,
    })
    bundle.stats = stats
    const webStats = stats.children.find(x => x.name === 'web')

    if (stats.errors && stats.errors.length > 0) {
      throw new Error(`Errors while building:\n\n${stats.errors.join('\n\n')}`)
    }

    spin.text = `Building Sanity (${stats.children.reduce((result, x) => result + x.time, 0)}ms)`
    spin.succeed()

    if (flags.profile) {
      await fse.writeFile(
        path.join(workDir, 'build-stats.json'),
        JSON.stringify(statistics.toJson('verbose'))
      )
    }

    // Build new index document with correct hashes
    const indexStart = Date.now()
    spin = output.spinner('Building index document').start()
    const createIndexHtmlFile = path.resolve(actualOutputPath, 'createIndexHtml.js')
    const { createIndexHtml } = importFresh(createIndexHtmlFile)
    const html = createIndexHtml(webStats)

    // Write index file to output destination
    await fse.writeFile(
      path.join(actualOutputPath, 'index.html'),
      html
    )

    // Remove createIndexHtml.js file
    await fse.remove(createIndexHtmlFile)

    // Print build output, optionally stats if requested
    stats.warnings.forEach(output.print)
    spin.text = `Building index document (${Date.now() - indexStart}ms)`
    spin.succeed()

    if (flags.stats) {
      output.print('\nLargest modules (unminified, uncompressed sizes):')
      sortModulesBySize(stats.modules)
        .slice(0, 10)
        .forEach(module => output.print(`[${filesize(module.size)}] ${module.name}`))
    }

    // Copy static assets (from /static folder) to output dir
    await fse.copy(path.join(workDir, 'static'), path.join(actualOutputPath, 'static'), {overwrite: false})
  } catch (err) {
    spin.fail()
    throw err
  }

  return bundle
}

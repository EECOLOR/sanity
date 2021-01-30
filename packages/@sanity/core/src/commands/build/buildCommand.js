import lazyRequire from '@sanity/util/lib/lazyRequire'

/*
  TODO: DISCUSS:
    I think sourcemaps should always be included.
    As for minify, just don't add NODE_ENV = production (which should be set to get React into
    production mode).

  --source-maps Enable source maps for built bundles (increases size of bundle)
  --no-minify Skip minifying built JavaScript (speeds up build, increases size of bundle)
*/
const helpText = `
Options
  -y, --yes Use unattended mode, accepting defaults and using only flags for choices

Example
  sanity build
`

export default {
  name: 'build',
  signature: '[OUTPUT_DIR]',
  description: 'Builds the current Sanity configuration to a static bundle',
  action: lazyRequire(require.resolve('../../actions/build/buildStaticAssets')),
  helpText
}

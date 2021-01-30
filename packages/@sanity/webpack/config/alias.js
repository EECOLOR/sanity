const rxPaths = require('rxjs/_esm5/path-mapping')

module.exports = { createAlias }

function createAlias({ context }) {
  const { reactPath, reactDomPath } = resolveReactPaths(context)
  return {
    react: reactPath,
    'react-dom$': reactDomPath,
    'react-dom/server': silentResolve(context, 'react-dom/server'),
    moment$: 'moment/moment.js',
    ...rxPaths()
  }
}

function resolveReactPaths(context) {
  const reactPath = silentResolve(context, 'react')
  const reactDomPath = silentResolve(context, 'react-dom')

  const missing = [!reactPath && `'react'`, !reactDomPath && `'react-dom'`].filter(Boolean)
  if (missing.length) throw new Error([
    `Could not find ${missing.join(', ')} dependencies in project directory`,
    'These need to be declared in `package.json` and be installed for Sanity to work'
  ].join('\n'))

  return { reactPath, reactDomPath }
}

function silentResolve(context, id) {
  try {
    return require.resolve(id, { paths: [context] })
  } catch (e) {
    return null
  }
}

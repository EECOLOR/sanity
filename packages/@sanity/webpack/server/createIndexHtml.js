import Document from 'part:@sanity/base/document'
import React from 'react'
import ReactDom from 'react-dom/server'

export function createIndexHtml(stats) {
  const { publicPath, assets } = stats

  const { js, css } = assets.reduce(
    (result, { name }) => {
      const [extension] = name.split('.').slice(-1)
      const previous = result[extension] || []
      return { ...result, [extension]: [...previous, `${publicPath}${name}`] }
    },
    { js: [], css: [] }
  )

  return (
    '<!doctype html>' +
    ReactDom.renderToStaticMarkup(
      <Document
        basePath={publicPath}
        scripts={js}
        stylesheets={css}
      />
    )
  )
}

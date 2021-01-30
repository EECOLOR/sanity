import PropTypes from 'prop-types'
import React from 'react'
import uncaughtErrorHandler from '../util/uncaughtErrorHandler'
import generateScriptLoader from '../util/generateScriptLoader'
import AppLoadingScreen from './AppLoadingScreen'
import NoJavascript from './NoJavascript'

function Document(props) {
  const basePath = props.basePath.replace(/\/+$/, '')
  const staticPath = `${basePath}${props.staticPath}`

  const stylesheets = props.stylesheets.map(item => (
    <link key={item} rel="stylesheet" href={item} />
  ))

  // TODO: DISCUSS: I think this should be replaced with <script defer />
  // https://stackoverflow.com/a/29475909 contains an alternative
  const subresources = props.scripts.map(item => (
    <link key={item} rel="subresource" href={item} />
  ))

  const scriptLoader = generateScriptLoader(props.scripts)
  const errorHandler = uncaughtErrorHandler()

  const favicons = props.favicons.map(item => (
    <link key={item} rel="icon" href={`${staticPath}/${item}`} />
  ))

  return (
    <html>
      <head>
        <meta charSet={props.charset} />
        <title>{props.title}</title>
        <meta name="viewport" content={props.viewport} />
        {stylesheets}
        {subresources}
        {favicons}
      </head>
      <body id="sanityBody">
        <div id="sanity">
          <AppLoadingScreen text={props.loading} />
          <NoJavascript />
        </div>

        {/* eslint-disable react/no-danger */}
        <script dangerouslySetInnerHTML={{__html: errorHandler}} />
        <script dangerouslySetInnerHTML={{__html: scriptLoader}} />
        {/* eslint-enable react/no-danger */}
      </body>
    </html>
  )
}

Document.defaultProps = {
  basePath: '',
  charset: 'utf-8',
  title: 'Sanity',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  loading: 'Connecting to Sanity.io',
  staticPath: '/static',
  favicons: ['favicon.ico'],
  stylesheets: [],
  scripts: []
}

Document.propTypes = {
  basePath: PropTypes.string,
  charset: PropTypes.string,
  title: PropTypes.string,
  viewport: PropTypes.string,
  loading: PropTypes.node,
  staticPath: PropTypes.string,
  favicons: PropTypes.arrayOf(PropTypes.string),
  stylesheets: PropTypes.arrayOf(PropTypes.string),
  scripts: PropTypes.arrayOf(PropTypes.string)
}

export default Document

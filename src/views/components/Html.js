import React, { PropTypes } from 'react'

const Layout = ({ children }) => {
  return (
    <html>
      <head>
        <title>Punwave</title>
        <meta name="description" content="Google's material design UI components built with React." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700" rel="stylesheet" />
        <link rel="stylesheet" href="/css/styles.css" />
      </head>
      <body>
        <div>
          {children}
        </div>
        <script src="/js/bundle.js" charSet="UTF-8" />
      </body>
    </html>
  )
}

Layout.propTypes = {
  children: PropTypes.node
}

export default Layout

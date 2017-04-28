import React, { Component, PropTypes } from 'react'

class Layout extends Component {
  static propTypes = {
    children: PropTypes.node
  }

  render () {
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
            {this.props.children}
          </div>
          <script src="/bundle.js"></script>
        </body>
      </html>
    )
  }
}

export default Layout

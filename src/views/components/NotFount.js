import React, { Component } from 'react'

class NotFound extends Component {
  render () {
    return (
      <h1>URL: {location && location.pathname} - Not Found(404)</h1>
    )
  }
}

export default NotFound

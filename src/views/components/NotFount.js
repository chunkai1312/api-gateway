import React, { Component, PropTypes } from 'react'

class NotFound extends Component {
  static propTypes = {}

  render () {
    return (
      <h1>URL: {this.props.location.pathname} - Not Found(404)</h1>
    )
  }
}

export default NotFound

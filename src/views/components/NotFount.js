import React, { Component, PropTypes } from 'react'

class NotFound extends Component {
  static propTypes = {
    location: PropTypes.object
  }

  render () {
    const { location } = this.props
    return (
      <h1>URL: {location && location.pathname} - Not Found(404)</h1>
    )
  }
}

export default NotFound

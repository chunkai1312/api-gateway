import React, { Component, PropTypes } from 'react'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { teal100, teal500, teal700 } from 'material-ui/styles/colors'
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: teal500,
    primary2Color: teal700,
    primary3Color: teal100
  }
}, { userAgent: 'all' })

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#e0e0e0',
    overflowY: 'auto'
  },
  ribbon: {
    height: '40vh',
    backgroundColor: teal700,
    backgroundSize: 'cover'
  },
  main: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '-35vh'
  },
  paper: {
    minHeight: '70vh',
    width: '80%',
    margin: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    width: 36,
    height: 36
  },
  iconStyleLeft: {
    margin: '14px 16px 14px 0'
  }
}

class Layout extends Component {
  static propTypes = {
    children: PropTypes.node
  }

  render () {
    const { children } = this.props
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={styles.container}>
          <AppBar title="Punwave" iconElementLeft={<img src="/img/icon.png" alt="Icon" style={styles.icon} />} iconStyleLeft={styles.iconStyleLeft} />
          <div style={styles.ribbon} />
          <div style={styles.main}>
            <Paper className="paper" zDepth={2} style={styles.paper}>
              {children}
            </Paper>
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default Layout

import React, { Component, PropTypes } from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'

const styles = {
  loginPage: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16
  },
  logo: {
    width: 150
  },
  buttonWrapper: {
    margin: '0.5em 0'
  }
}

class Login extends Component {
  static propTypes = {
    messages: PropTypes.object
  }

  render () {
    const { messages } = this.props

    const showErrorText = (name) => {
      const message = messages.errors && messages.errors.find(message => message.param === name)
      return message ? message.msg : null
    }

    return (
      <div style={styles.loginPage}>
        <img src="/img/punwave.png" alt="Punwave" style={styles.logo} className="logo" />
        <form action="/login" method="POST">
          <div>
            <TextField
              id="identifier"
              name="identifier"
              type="text"
              floatingLabelText="Username / Email"
              errorText={showErrorText('login')}
              className="text-field"
            />
          </div>
          <div>
            <TextField
              id="password"
              name="password"
              type="password"
              floatingLabelText="Password"
              errorText={showErrorText('password')}
              className="text-field"
            />
          </div>
          <br />
          <div style={styles.buttonWrapper}>
            <RaisedButton type="submit" label="Login" primary fullWidth />
          </div>
          <div style={styles.buttonWrapper}>
            <FlatButton label="Forgot Your Password?" fullWidth href="/password/forgot" />
          </div>
          <div style={styles.buttonWrapper}>
            <FlatButton label="New to Punwave? Create Your Account!" fullWidth href="/signup" />
          </div>
        </form>
      </div>
    )
  }
}

export default Login

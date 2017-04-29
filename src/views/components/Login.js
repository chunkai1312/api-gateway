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
    margin: '1em 0'
  }
}

class Login extends Component {
  static propTypes = {
    router: PropTypes.object
  }

  render () {
    const { router } = this.props
    return (
      <div style={styles.loginPage}>
        <img src="/img/punwave.png" alt="Punwave" style={styles.logo} className="logo" />
        <form action="/login" method="POST">
          <div>
            <TextField id="username" name="username" type="text" floatingLabelText={'Username'} className="text-field" />
          </div>
          <div>
            <TextField id="password" name="password" type="password" floatingLabelText={'Password'} className="text-field" />
          </div>
          <br />
          <div style={styles.buttonWrapper}>
            <RaisedButton type="submit" label="Login" primary fullWidth />
          </div>
          <div style={styles.buttonWrapper}>
            <FlatButton label="Forgot Your Password?" fullWidth onClick={() => router.push('/password/forgot')} />
          </div>
        </form>
      </div>
    )
  }
}

export default Login

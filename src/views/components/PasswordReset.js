import React, { Component, PropTypes } from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'

const styles = {
  passwordForgot: {
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

class PasswordReset extends Component {
  static propTypes = {
    router: PropTypes.object,
    username: PropTypes.string,
    messages: PropTypes.object
  }

  render () {
    const { router, username, messages } = this.props

    const showErrorText = (name) => {
      const message = messages.errors && messages.errors.find(message => message.param === name)
      return message ? message.msg : null
    }

    return (
      <div style={styles.passwordForgot}>
        <img src="/img/punwave.png" alt="Punwave" style={styles.logo} className="logo" />

        {messages.success
          ? <p>{messages.success && messages.success.map(success => success.msg)}</p>
          : <p>{messages.info && messages.info.map(info => info) || `Change password for @${username}`}</p>
        }

        {messages.success
          ? (
            <div style={styles.buttonWrapper}>
              <RaisedButton label="Return to Login" primary onClick={() => router.push('/login')} />
            </div>
          ) : (
            <form action="" method="POST">
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
              <div>
                <TextField
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  floatingLabelText="Confirm Password"
                  errorText={showErrorText('confirmPassword')}
                  className="text-field"
                />
              </div>
              <br />
              <div style={styles.buttonWrapper}>
                <RaisedButton type="submit" label="Change Password" primary fullWidth />
              </div>
            </form>
          )}
      </div>
    )
  }
}

export default PasswordReset

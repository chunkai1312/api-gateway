import React, { Component, PropTypes } from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'

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

class PasswordForgot extends Component {
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
      <div style={styles.passwordForgot}>
        <img src="/img/punwave.png" alt="Punwave" style={styles.logo} className="logo" />

        {messages.success
          ? <p>{messages.success && messages.success.map(success => success.msg)}</p>
          : <p>{messages.info && messages.info.map(info => info) || 'Enter your email address and we will send you a link to reset your password.'}</p>
        }

        {messages.success
          ? (
            <div style={styles.buttonWrapper}>
              <RaisedButton label="Return to Login" primary onClick={() => router.push('/login')} />
            </div>
          ) : (
            <form action="/password/forgot" method="POST">
              <div>
                <TextField
                  id="email"
                  name="email"
                  type="email"
                  floatingLabelText={'Email'}
                  errorText={showErrorText('email')}
                  className="text-field"
                />
              </div>
              <br />
              <div style={styles.buttonWrapper}>
                <RaisedButton type="submit" label="Send Password Reset Email" primary fullWidth />
              </div>
              <div style={styles.buttonWrapper}>
                <FlatButton label="Return to Login" fullWidth href="/login" />
              </div>
            </form>
          )}
      </div>
    )
  }
}

export default PasswordForgot

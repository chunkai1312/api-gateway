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


const PasswordReset = ({ router, username, messages }) => {
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
              <TextField id="password" name="password" type="password" floatingLabelText={'Password'} className="text-field" />
            </div>
            <div>
              <TextField id="confirm" name="confirm" type="password" floatingLabelText={'Confirm Password'} className="text-field" />
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

PasswordReset.propTypes = {
  router: PropTypes.object,
  username: PropTypes.string,
  messages: PropTypes.object
}

export default PasswordReset


// Password must contain one lowercase letter, one number, and be at least 7 characters long.
import React, { Component, PropTypes } from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'

const styles = {
  signup: {
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
    margin: '1em 0',
    textAlign: 'center'
  }
}

class Signup extends Component {
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
      <div style={styles.signup}>
        <img src="/img/punwave.png" alt="Punwave" style={styles.logo} className="logo" />
        <form action="/signup" method="POST">
          <div className="text-field-wrapper">
            <TextField
              id="firstName"
              name="firstName"
              type="text"
              floatingLabelText="First Name"
              errorText={showErrorText('firstName')}
              className="text-field"
            />
            <TextField
              id="lastName"
              name="lastName"
              type="text"
              floatingLabelText="Last Name"
              errorText={showErrorText('lastName')}
              className="text-field"
            />
          </div>
          <div className="text-field-wrapper">
            <TextField
              id="username"
              name="username"
              type="text"
              floatingLabelText="Username"
              errorText={showErrorText('username')}
              className="text-field"
            />
            <TextField
              id="email"
              name="email"
              type="email"
              floatingLabelText="Email"
              errorText={showErrorText('email')}
              className="text-field"
            />
          </div>
          <div className="text-field-wrapper">
            <TextField
              id="password"
              name="password"
              type="password"
              floatingLabelText="Password"
              errorText={showErrorText('password')}
              className="text-field"
            />
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
            <RaisedButton type="submit" label="Sign Up" fullWidth primary />
          </div>
          <div style={styles.buttonWrapper}>
            <FlatButton label="Return to Login" fullWidth href="/login" />
          </div>
        </form>
      </div>
    )
  }
}

export default Signup

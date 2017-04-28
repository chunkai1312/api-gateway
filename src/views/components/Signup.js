import React, { Component, PropTypes } from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'

const styles = {
  signupPage: {
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
  },
  textFieldWrapper: {
    textAlign: 'center'
  }
}

class Signup extends Component {
  static propTypes = {}

  render () {
    return (
      <div style={styles.signupPage}>
        <img src="/img/punwave.png" alt="Punwave" style={styles.logo} className="logo" />
        <form action="/signup" method="POST">
          <div style={styles.textFieldWrapper}>
            <TextField id="firstName" name="firstName" type="text" floatingLabelText={'First Name'} className="text-field" />
            {' '}
            <TextField id="lastName" name="lastName" type="text" floatingLabelText={'Last Name'} className="text-field" />
          </div>
          <div style={styles.textFieldWrapper}>
            <TextField id="username" name="username" type="text" floatingLabelText={'Username'} className="text-field" />
            {' '}
            <TextField id="email" name="email" type="email" floatingLabelText={'Email'} className="text-field" />
          </div>
          <div style={styles.textFieldWrapper}>
            <TextField id="password" name="password" type="password" floatingLabelText={'Password'} className="text-field" />
            {' '}
            <TextField id="confirm" name="confirm" type="password" floatingLabelText={'Confirm Password'} className="text-field" />
          </div>
          <br />
          <div style={styles.buttonWrapper}>
            <RaisedButton type="submit" label="Signup" primary fullWidth />
          </div>
        </form>
      </div>
    )
  }
}

export default Signup

import React, { Component } from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'

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
  },
  textFieldWrapper: {
    textAlign: 'center'
  }
}

class Signup extends Component {
  render () {
    return (
      <div style={styles.signup}>
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
            <RaisedButton type="submit" label="Signup" primary />
          </div>
        </form>
      </div>
    )
  }
}

export default Signup

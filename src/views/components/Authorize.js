import React, { Component, PropTypes } from 'react'
import RaisedButton from 'material-ui/RaisedButton'

const styles = {
  authorize: {
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
  button: {
    margin: '0 1em'
  }
}

class Authorize extends Component {
  static propTypes = {
    transactionID: PropTypes.string,
    user: PropTypes.object,
    client: PropTypes.object
  }

  render () {
    const { transactionID, user, client } = this.props
    return (
      <div style={styles.authorize}>
        <img src="/img/punwave.png" alt="Punwave" style={styles.logo} className="logo" />
        <p>Hi <b>{user.profile && user.profile.name},</b></p>
        <p>The application <b>{client.name}</b> is requesting access to your account.</p>
        <p>Do you approve?</p>
        <form action="/oauth2/authorize" method="POST">
          <input id="transaction_id" name="transaction_id" type="hidden" value={transactionID} />
          <br />
          <div style={styles.buttonWrapper}>
            <RaisedButton type="submit" id="allow" value="Accept" label="Accept" primary />
            <RaisedButton type="submit" id="deny" name="cancel" value="Deny" label="Deny" style={styles.button} />
          </div>
        </form>
      </div>
    )
  }
}

export default Authorize

import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { BasicStrategy } from 'passport-http'
import { Strategy as ClientPasswordStrategy } from 'passport-oauth2-client-password'
import { Strategy as BearerStrategy } from 'passport-http-bearer'
import { OAuthUser, OAuthClient, OAuthToken } from '../models'

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
const local = new LocalStrategy(async (usernameOrEmail, password, done) => {
  try {
    const user = await OAuthUser.getByUsernameOrEmail(usernameOrEmail)
    if (!user) return done(null, false)
    const isAuthenticated = await user.authenticate(password)
    if (!isAuthenticated) return done(null, false)
    done(null, user)
  } catch (err) {
    done(err)
  }
})

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients.  They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate.  Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header).  While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
const basic = new BasicStrategy(async (username, password, done) => {
  try {
    const client = await OAuthClient.findById(username)
    if (!client) return done(null, false)
    if (client.secret !== password) return done(null, false)
    done(null, client)
  } catch (err) {
    done(err)
  }
})

/**
 * Client Password strategy
 *
 * The OAuth 2.0 client password authentication strategy authenticates clients
 * using a client ID and client secret. The strategy requires a verify callback,
 * which accepts those credentials and calls done providing a client.
 */

const oauth2ClientPassword = new ClientPasswordStrategy(async (clientId, clientSecret, done) => {
  try {
    const client = await OAuthClient.findById(clientId)
    if (!client) return done(null, false)
    if (client.secret !== clientSecret) return done(null, false)
    return done(null, client)
  } catch (err) {
    done(err)
  }
})

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token).  If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 *
 * To keep this example simple, restricted scopes are not implemented, and this is just for
 * illustrative purposes
 */
const bearer = new BearerStrategy(async (accessToken, done) => {
  try {
    const token = await OAuthToken.getByAccessToken(accessToken)
    if (!token) return done(null, false)

    if (!token.isValid()) {
      await token.remove()
      return done(null, false)
    }

    const client = await OAuthClient.findById(token.client)
    // if (client.trusted) return done(null, client, token)

    if (token.user !== null) {
      const user = await OAuthUser.findById(token.user)
      if (!user) return done(null, false)
      return done(null, user.toJSON(), token)
    }

    done(null, client.toJSON(), token)
  } catch (err) {
    done(err)
  }
})

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTPS request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

const serializeUser = (user, done) => done(null, user)
const deserializeUser = (user, done) => done(null, user)

export default function setupPassport () {
  passport.use(local)
  passport.use(basic)
  passport.use(oauth2ClientPassword)
  passport.use(bearer)
  passport.serializeUser(serializeUser)
  passport.deserializeUser(deserializeUser)
}

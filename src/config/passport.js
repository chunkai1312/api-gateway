import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { BasicStrategy } from 'passport-http'
import { Strategy as ClientPasswordStrategy } from 'passport-oauth2-client-password'
import { Strategy as BearerStrategy } from 'passport-http-bearer'
import OAuthUser from '../models/oauth_user'
import OAuthClient from '../models/oauth_client'
import OAuthToken, { verifyToken } from '../models/oauth_token'
import AuthService from '../services/auth'
import OAuthService from '../services/oauth/oauth'

const authService = AuthService()
const oauthService = OAuthService()

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy({ usernameField: 'login' }, async (login, password, done) => {
  const user = await authService.authenticate(login, password)
  return user ? done(null, user) : done(null, false)
}))

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
passport.use(new BasicStrategy(async (username, password, done) => {
  const client = await oauthService.getClient(username, password)
  return client ? done(null, client) : done(null, false)
}))

/**
 * Client Password strategy
 *
 * The OAuth 2.0 client password authentication strategy authenticates clients
 * using a client ID and client secret. The strategy requires a verify callback,
 * which accepts those credentials and calls done providing a client.
 */

passport.use(new ClientPasswordStrategy(async (clientId, clientSecret, done) => {
  const client = await oauthService.getClient(clientId, clientSecret)
  return client ? done(null, client) : done(null, false)
}))

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
passport.use(new BearerStrategy(async (accessToken, done) => {
  try {
    verifyToken(accessToken)

    const token = await OAuthToken.findToken(accessToken)
    if (!token) throw new Error('Invalid token')

    const { user: userId, clientId, scope } = token.payload

    const user = (userId)
      ? await OAuthUser.findById(userId)
      : await OAuthClient.findByClientId(clientId)

    done(null, user, { scope })
  } catch (err) {
    done(err)
  }
}))

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
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

import querystring from 'querystring'
import oauth2orize from 'oauth2orize'
import passport from 'passport'
import login from 'connect-ensure-login'
import { OAuthUser, OAuthClient } from '../models/'
import OAuthToken, { types, createToken } from '../models/oauth_token'
import { oauth2, baseUrl } from '../config'

// create OAuth 2.0 server
const server = oauth2orize.createServer()

// Configured expiresIn
const expiresIn = { expires_in: oauth2.accessToken.expiresIn }

/**
 * Grant authorization codes
 *
 * The callback takes the `client` requesting authorization, the `redirectURI`
 * (which is used as a verifier in the subsequent exchange), the authenticated
 * `user` granting access, and their response, which contains approved scope,
 * duration, etc. as parsed by the application.  The application issues a code,
 * which is bound to these values, and will be exchanged for an access token.
 */
server.grant(oauth2orize.grant.code((client, redirectURI, user, ares, done) => {
  const authorizationCode = createToken({ subject: user.id, expiresIn: oauth2.authorizationCode.expiresIn })
  const payload = { user: user.id, clientId: client.clientId, redirectURI: redirectURI, scope: ares.scope }

  OAuthToken.saveToken(authorizationCode, types.AUTHORIZATION_CODE, payload)
    .then(() => done(null, authorizationCode))
    .catch(() => done(null, false))
}))

/**
 * Grant implicit authorization.
 *
 * The callback takes the `client` requesting authorization, the authenticated
 * `user` granting access, and their response, which contains approved scope,
 * duration, etc. as parsed by the application.  The application issues a token,
 * which is bound to these values.
 */
server.grant(oauth2orize.grant.token((client, user, ares, done) => {
  const accessToken = createToken({ subject: user.id, expiresIn: oauth2.accessToken.expiresIn })
  const payload = { user: user.id, clientId: client.clientId, scope: ares.scope }

  OAuthToken.saveToken(accessToken, types.AUTHORIZATION_CODE, payload)
    .then(() => done(null, accessToken, expiresIn))
    .catch(() => done(null, false))
}))

/**
 * Exchange authorization codes for access tokens.
 *
 * The callback accepts the `client`, which is exchanging `code` and any
 * `redirectURI` from the authorization request for verification.  If these values
 * are validated, the application issues an access token on behalf of the user who
 * authorized the code.
 */
server.exchange(oauth2orize.exchange.code((client, code, redirectURI, done) => {
  OAuthToken.removeToken(code)
    .then(token => token.validateAuthorizationCode(code, client, redirectURI))
    .then(token => {
      const accessToken = createToken({ subject: token.payload.user.toString(), expiresIn: oauth2.accessToken.expiresIn })
      const refreshToken = createToken({ subject: token.payload.user.toString(), expiresIn: oauth2.refreshToken.expiresIn })
      const payload = token.payload

      return Promise.all([
        Promise.resolve(accessToken),
        Promise.resolve(refreshToken),
        OAuthToken.saveToken(accessToken, types.ACCESS_TOKEN, payload),
        OAuthToken.saveToken(refreshToken, types.REFRESH_TOKEN, payload)
      ])
    })
    .then(([accessToken, refreshToken]) => done(null, accessToken, refreshToken, expiresIn))
    .catch(() => done(null, false))
}))

/**
 * Exchange user id and password for access tokens.
 *
 * The callback accepts the `client`, which is exchanging the user's name and password
 * from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the user who authorized the code.
 */
server.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
  OAuthUser.findByUsername(username)
    .then(user => {
      if (!user) throw new Error('User does not exist')
      return Promise.all([ Promise.resolve(user), user.authenticate(password) ])
    })
    .then(([ user, isAuthenticate ]) => {
      if (!isAuthenticate) throw new Error('User password does not match')
      const accessToken = createToken({ subject: user.id, expiresIn: oauth2.accessToken.expiresIn })
      const refreshToken = createToken({ subject: user.id, expiresIn: oauth2.refreshToken.expiresIn })
      const payload = { user: user.id, clientId: client.clientId, scope: scope }

      return Promise.all([
        Promise.resolve(accessToken),
        Promise.resolve(refreshToken),
        OAuthToken.saveToken(accessToken, types.ACCESS_TOKEN, payload),
        OAuthToken.saveToken(refreshToken, types.REFRESH_TOKEN, payload)
      ])
    })
    .then(([accessToken, refreshToken]) => done(null, accessToken, refreshToken, expiresIn))
    .catch(() => done(null, false))
}))

/**
 * Exchange the client id and password/secret for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id and
 * password/secret from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the client who authorized the code.
 */
server.exchange(oauth2orize.exchange.clientCredentials((client, scope, done) => {
  const accessToken = createToken({ subject: client.clientId, expiresIn: oauth2.accessToken.expiresIn })
  const payload = { user: null, clientId: client.clientId, scope: scope }

  OAuthToken.saveToken(accessToken, types.ACCESS_TOKEN, payload)
    .then(() => done(null, accessToken, null, expiresIn))
    .catch(() => done(null, false))
}))

/**
 * Exchange the refresh token for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id from the token
 * request for verification.  If this value is validated, the application issues an access
 * token on behalf of the client who authorized the code
 */
server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
  OAuthToken.findToken(refreshToken)
    .then(token => token.validateRefreshToken(refreshToken, client))
    .then(token => {
      const accessToken = createToken({ subject: token.payload.user.toString(), expiresIn: oauth2.accessToken.expiresIn })
      const payload = token.payload

      return Promise.all([
        Promise.resolve(accessToken),
        OAuthToken.saveToken(accessToken, types.ACCESS_TOKEN, payload)
      ])
    })
    .then(([accessToken]) => done(null, accessToken, null, expiresIn))
    .catch(() => done(null, false))
}))

/**
 * User authorization endpoint
 *
 * `authorization` middleware accepts a `validate` callback which is
 * responsible for validating the client making the authorization request.  In
 * doing so, is recommended that the `redirectURI` be checked against a
 * registered value, although security requirements may vary accross
 * implementations.  Once validated, the `done` callback must be invoked with
 * a `client` instance, as well as the `redirectURI` to which the user will be
 * redirected after an authorization decision is obtained.
 *
 * This middleware simply initializes a new authorization transaction.  It is
 * the application's responsibility to authenticate the user and render a dialog
 * to obtain their approval (displaying details about the client requesting
 * authorization).  We accomplish that here by routing through `ensureLoggedIn()`
 * first, and rendering the `dialog` view.
 */
const authorization = [
  login.ensureLoggedIn(`/login?continue=${baseUrl}/oauth2/authorize`),
  server.authorization((clientId, redirectURI, scope, done) => {
    OAuthClient.findByClientId(clientId)
      .then(client => {
        if (!client || !client.hasRedirectURI(redirectURI)) throw new Error('Redirect URI is invalid')
        return done(null, client, redirectURI)
      })
      .catch(() => done(null, false))
  }),
  async (req, res, next) => {
    OAuthClient.findByClientId(req.query.client_id)
      .then(client => {
        if (client.trusted) {
          server.decision({ loadTransaction: false }, (request, callback) => {
            callback(null, { allow: true })
          })(req, res, next)
        } else {
          res.render(req.url, {
            transactionID: req.oauth2.transactionID,
            user: req.user,
            client: req.oauth2.client,
            scope: req.oauth2.req.scope,
            logout: `/logout?continue=${querystring.escape(req.url)}`
          })
        }
      })
      .catch(err => next(err))
  }
]

/**
 * User decision endpoint
 *
 * `decision` middleware processes a user's decision to allow or deny access
 * requested by a client application.  Based on the grant type requested by the
 * client, the above grant middleware configured above will be invoked to send
 * a response.
 */
const decision = [
  login.ensureLoggedIn(`/login?continue=${baseUrl}/oauth2/decision`),
  server.decision((req, done) => done(null, { scope: req.oauth2.req.scope }))
]

/**
 * Token endpoint
 *
 * `token` middleware handles client requests to exchange authorization grants
 * for access tokens.  Based on the grant type being exchanged, the above
 * exchange middleware will be invoked to handle the request.  Clients must
 * authenticate when making requests to this endpoint.
 */
const token = [
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  server.token(),
  server.errorHandler()
]

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

server.serializeClient((client, done) => {
  done(null, client.id)
})

server.deserializeClient((id, done) => {
  OAuthClient.findById(id, (err, client) => {
    if (err) return done(err)
    return done(err, client)
  })
})

export default {
  authorization,
  decision,
  token
}

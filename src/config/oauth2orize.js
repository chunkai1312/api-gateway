import querystring from 'querystring'
import oauth2orize from 'oauth2orize'
import passport from 'passport'
import login from 'connect-ensure-login'
import { OAuthService } from '../services/oauth'
import { oauth2, baseUrl } from '../config'

const oauthService = OAuthService()

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
server.grant(oauth2orize.grant.code(async (client, redirectUri, user, ares, done) => {
  const { scope } = ares
  const authorizationCode = await oauthService.generateAuthorizationCode(client, user, scope)
  const code = { authorizationCode, redirectUri, scope }
  await oauthService.saveAuthorizationCode(code, client, user)
  done(null, authorizationCode)
}))

/**
 * Grant implicit authorization.
 *
 * The callback takes the `client` requesting authorization, the authenticated
 * `user` granting access, and their response, which contains approved scope,
 * duration, etc. as parsed by the application.  The application issues a token,
 * which is bound to these values.
 */
server.grant(oauth2orize.grant.token(async (client, user, ares, done) => {
  const { scope } = ares
  const accessToken = await oauthService.generateAccessToken(client, user, scope)
  const token = { accessToken, scope }
  await oauthService.saveToken(token, client, user)
  done(null, accessToken, expiresIn)
}))

/**
 * Exchange authorization codes for access tokens.
 *
 * The callback accepts the `client`, which is exchanging `code` and any
 * `redirectURI` from the authorization request for verification.  If these values
 * are validated, the application issues an access token on behalf of the user who
 * authorized the code.
 */
server.exchange(oauth2orize.exchange.code(async (client, code, redirectURI, done) => {
  try {
    const authCode = await oauthService.getAuthorizationCode(code)
    if (!authCode) return done(null, false)

    const { user, scope } = authCode
    const accessToken = await oauthService.generateAccessToken(client, user, scope)
    const refreshToken = await oauthService.generateRefreshToken(client, user, scope)
    const token = { accessToken, refreshToken, scope }
    await oauthService.saveToken(token, client, user)
    done(null, accessToken, refreshToken, expiresIn)
  } catch (e) {
    done(null, false)
  }
}))

/**
 * Exchange user id and password for access tokens.
 *
 * The callback accepts the `client`, which is exchanging the user's name and password
 * from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the user who authorized the code.
 */
server.exchange(oauth2orize.exchange.password(async (client, username, password, scope, done) => {
  const user = await oauthService.getUser(username, password)
  if (!user) return done(null, false)

  const accessToken = await oauthService.generateAccessToken(client, user, scope)
  const refreshToken = await oauthService.generateRefreshToken(client, user, scope)
  const token = { accessToken, refreshToken, scope }
  await oauthService.saveToken(token, client, user)
  done(null, accessToken, refreshToken, expiresIn)
}))

/**
 * Exchange the client id and password/secret for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id and
 * password/secret from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the client who authorized the code.
 */
server.exchange(oauth2orize.exchange.clientCredentials(async (client, scope, done) => {
  const user = await oauthService.getUserFromClient(client)
  const accessToken = await oauthService.generateAccessToken(client, user, scope)
  const token = { accessToken, scope }
  await oauthService.saveToken(token, client, user)
  done(null, accessToken, expiresIn)
}))

/**
 * Exchange the refresh token for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id from the token
 * request for verification.  If this value is validated, the application issues an access
 * token on behalf of the client who authorized the code
 */
server.exchange(oauth2orize.exchange.refreshToken(async (client, refreshToken, scope, done) => {
  const authToken = await oauthService.getRefreshToken(refreshToken)
  if (!authToken) return done(null, false)

  const { user } = authToken
  const accessToken = await oauthService.generateAccessToken(client, user, scope)
  const token = { accessToken, scope }
  await oauthService.saveToken(token, client, user)
  done(null, accessToken, expiresIn)
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
  server.authorization(async (clientId, redirectURI, scope, done) => {
    const client = await oauthService.getClient(clientId)
    if (!client) return done(null, false)

    const hasRedirectURI = client.redirectUris.includes(redirectURI)
    if (!hasRedirectURI) return done(null, false)

    done(null, client, redirectURI)
  }),
  async (req, res, next) => {
    const client = await oauthService.getClient(req.query.client_id)
    if (client && client.trusted) {
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

server.serializeClient((client, done) => done(null, client))
server.deserializeClient((client, done) => done(null, client))

export default {
  authorization,
  decision,
  token
}

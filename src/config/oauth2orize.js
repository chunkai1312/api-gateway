import querystring from 'querystring'
import oauth2orize from 'oauth2orize'
import passport from 'passport'
import login from 'connect-ensure-login'
import { OAuthUser, OAuthClient, OAuthCode, OAuthToken } from '../models'

const server = oauth2orize.createServer()

/**
 * Grant authorization codes
 *
 * The callback takes the `client` requesting authorization, the `redirectURI`
 * (which is used as a verifier in the subsequent exchange), the authenticated
 * `user` granting access, and their response, which contains approved scope,
 * duration, etc. as parsed by the application.  The application issues a code,
 * which is bound to these values, and will be exchanged for an access token.
 */
server.grant(oauth2orize.grant.code(async (client, redirectURI, user, ares, done) => {
  try {
    const authCode = await OAuthCode.create({
      client: client.id,
      user: user.id,
      redirectURI,
      scope: ares.scope
    })
    done(null, authCode.code)
  } catch (err) {
    done(err)
  }
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
  try {
    const token = await OAuthToken.create({
      client: client.id,
      user: user.id,
      scope: ares.scope
    })
    done(null, token.accessToken, { expires_in: token.expiresIn })
  } catch (err) {
    done(err)
  }
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
    const authCode = await OAuthCode.getByCode(code)
    if (!authCode) return done(null, false)
    if (!authCode.isValid()) {
      await authCode.remove()
      return done(null, false)
    }
    if (!authCode.verify(client.id, redirectURI)) return done(null, false)

    await authCode.remove()
    const token = await OAuthToken.create({
      user: authCode.user,
      client: authCode.client,
      scope: authCode.scope
    })
    done(null, token.accessToken, token.refreshToken, { expires_in: token.expiresIn })
  } catch (err) {
    done(err)
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
  try {
    const user = await OAuthUser.getByUsername(username)
    if (!user) return done(null, false)
    const isAuthenticated = await user.authenticate(password)
    if (!isAuthenticated) return done(null, false)

    const token = await OAuthToken.create({
      user: user.id,
      client: client.id,
      scope
    })
    done(null, token.accessToken, token.refreshToken, { expires_in: token.expiresIn })
  } catch (err) {
    done(err)
  }
}))

/**
 * Exchange the client id and password/secret for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id and
 * password/secret from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the client who authorized the code.
 */
server.exchange(oauth2orize.exchange.clientCredentials(async (client, scope, done) => {
  try {
    const token = await OAuthToken.create({
      refreshToken: null,
      user: null,
      client: client.id,
      scope
    })
    done(null, token.accessToken, token.refreshToken, { expires_in: token.expiresIn })
  } catch (err) {
    done(err)
  }
}))

/**
 * Exchange the refresh token for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id from the token
 * request for verification.  If this value is validated, the application issues an access
 * token on behalf of the client who authorized the code
 */
server.exchange(oauth2orize.exchange.refreshToken(async (client, refreshToken, scope, done) => {
  try {
    const rToken = await OAuthToken.getByRefreshToken(refreshToken)
    if (!rToken) return done(null, false)
    if (!rToken.client.equals(client.id)) return done(null, false)

    const token = await OAuthToken.create({
      user: rToken.user,
      client: rToken.client,
      scope: rToken.scope
    })
    await rToken.remove()
    done(null, token.accessToken, token.refreshToken, { expires_in: token.expiresIn })
  } catch (err) {
    done(err)
  }
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
  login.ensureLoggedIn(),
  server.authorization(async (clientId, redirectURI, scope, done) => {
    try {
      const client = await OAuthClient.findById(clientId)
      if (!client || !client.hasRedirectURI(redirectURI)) return done(null, false)
      done(null, client, redirectURI)
    } catch (err) {
      done(err)
    }
  }),
  async (req, res, next) => {
    try {
      const client = await OAuthClient.findById(req.query.client_id)
      if (client.trusted) {
        server.decision({ loadTransaction: false }, (request, callback) => {
          callback(null, { allow: true })
        })(req, res, next)
      } else {
        res.render('authorize', {
          transactionID: req.oauth2.transactionID,
          user: req.oauth2.user,
          client: req.oauth2.client,
          scope: req.oauth2.req.scope,
          logout: `/logout?continue=${querystring.escape(req.url)}`
        })
      }
    } catch (err) {
      next(err)
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
  login.ensureLoggedIn(),
  server.decision((req, done) => {
    done(null, { scope: req.oauth2.req.scope })
  })
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

server.serializeClient((client, done) => done(null, client.id))

server.deserializeClient((id, done) => {
  OAuthClient.findById(id, (err, client) => {
    done(err, client)
  })
})

export default {
  authorization,
  decision,
  token
}

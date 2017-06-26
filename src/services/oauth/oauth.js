import uuid from 'uuid/v4'
import jwt from 'jsonwebtoken'
import OAuthClient from '../../models/oauth_client'
import OAuthToken from '../../models/oauth_token'
import OAuthCode from '../../models/oauth_code'
import AuthService from '../../services/auth'
import config from '../../config'

const authService = AuthService()

function OAuthService (dependencies = {}) {
  const oauthService = {}

  const createToken = (options = { expiresIn: 3600, subject: '' }) => {
    const jti = uuid()
    const sub = options.subject
    const exp = Math.floor(Date.now() / 1000) + options.expiresIn
    return jwt.sign({ jti, sub, exp }, config.jwt.secret)
  }

  const verifyToken = (token) => {
    return jwt.verify(token, config.jwt.secret)
  }

  /**
   * Generate a new access token.
   */
  oauthService.generateAccessToken = async (client, user, scope) => {
    const options = {
      expiresIn: config.oauth2.accessToken.expiresIn,
      subject: user ? user.id : client.id
    }
    return createToken(options)
  }

  /**
   * Generate a new refresh token.
   */
  oauthService.generateRefreshToken = async (client, user, scope) => {
    const options = {
      expiresIn: config.oauth2.refreshToken.expiresIn,
      subject: user.id
    }
    return createToken(options)
  }

  /**
   * Generate a new authorization code.
   */
  oauthService.generateAuthorizationCode = async (client, user, scope) => {
    const options = {
      expiresIn: config.oauth2.authorizationCode.expiresIn,
      subject: user.id
    }
    return createToken(options)
  }

  /**
   * Retrieve an existing access token previously saved.
   */
  oauthService.getAccessToken = async (accessToken) => {
    const jwt = verifyToken(accessToken)
    const token = await OAuthToken.findOne({ accessToken: jwt.jti })
    return token
  }

  /**
   * Retrieve an existing refresh token previously saved.
   */
  oauthService.getRefreshToken = async (refreshToken) => {
    const jwt = verifyToken(refreshToken)
    const token = await OAuthToken.findOne({ refreshToken: jwt.jti })
    return token
  }

  /**
   * Retrieve an existing authorization code previously saved
   */
  oauthService.getAuthorizationCode = async (authorizationCode) => {
    const jwt = verifyToken(authorizationCode)

    const authCode = await OAuthCode
      .findOneAndRemove({ authorizationCode: jwt.jti })
      .populate('client')
      .populate('user')
      .exec()

    return authCode
  }

  /**
   * Retrieve a client using a client id or a client id/client secret combination.
   */
  oauthService.getClient = async (clientId, clientSecret) => {
    const query = clientSecret ? { clientId, clientSecret } : { clientId }
    const client = await OAuthClient.findOne(query)
    return client
  }

  /**
   * Retrieve a user using a username/password combination.
   */
  oauthService.getUser = async (username, password) => {
    const user = await authService.authenticate(username, password)
    return user
  }

  /**
   * Retrieve the user associated with the specified client.
   */
  oauthService.getUserFromClient = async (client) => {
    return null
  }

  /**
   * Save an access token and optionally a refresh token.
   */
  oauthService.saveToken = async (token, client, user) => {
    const decodedAccessToken = jwt.decode(token.accessToken)

    const accessToken = new OAuthToken({
      accessToken: decodedAccessToken.jti,
      client: client.id,
      user: user ? user.id : null,
      scope: token.scope,
      expiresAt: decodedAccessToken.exp * 1000
    })

    if (!token.refreshToken) {
      await accessToken.save()

      return {
        accessToken: accessToken.accessToken,
        accessTokenExpiresAt: accessToken.expiresAt,
        scope: accessToken.scope,
        client: { id: accessToken.client },
        user: { id: accessToken.user }
      }
    }

    const decodedRefreshToken = jwt.decode(token.refreshToken)

    const refreshToken = new OAuthToken({
      refreshToken: decodedRefreshToken.jti,
      client: client.id,
      user: user.id,
      scope: token.scope,
      expiresAt: decodedRefreshToken.exp * 1000
    })

    await [accessToken.save(), refreshToken.save()]

    return {
      accessToken: accessToken.accessToken,
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshToken: refreshToken.refreshToken,
      refreshTokenExpiresAt: refreshToken.expiresAt,
      scope: accessToken.scope,
      client: { id: accessToken.client },
      user: { id: accessToken.user }
    }
  }

  /**
   * Save an authorization code.
   */
  oauthService.saveAuthorizationCode = async (code, client, user) => {
    const { jti, exp } = jwt.decode(code.authorizationCode)

    const authCode = new OAuthCode({
      authorizationCode: jti,
      expiresAt: exp * 1000,
      redirectUri: code.redirectUri,
      scope: code.scope,
      client: client.id,
      user: user.id
    })
    await authCode.save()

    return authCode
  }

  /**
   * Revoke a refresh token.
   */
  oauthService.revokeToken = async (token) => {
    const { refreshToken } = token
    const removed = await OAuthToken.findOneAndRemove({ refreshToken })
    return !!removed
  }

  /**
   * Revoke an authorization code.
   */
  oauthService.revokeAuthorizationCode = async (code) => {

  }

  /**
   * Check if the requested scope is valid for a particular client/user combination.
   */
  oauthService.validateScope = async (user, client, scope) => {

  }

  /**
   * Check if the provided access token was authorized the requested scopes.
   */
  oauthService.verifyScope = async (token, scope) => {
    if (!token.scope) return false
    let requestedScopes = scope.split(' ')
    let authorizedScopes = token.scope.split(' ')
    return requestedScopes.every(s => authorizedScopes.indexOf(s) >= 0)
  }

  return oauthService
}

export default OAuthService

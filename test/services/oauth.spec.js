import OAuthUserRepository from '../../src/repositories/oauth_user'
import OAuthClientRepository from '../../src/repositories/oauth_client'
import OAuthCodeRepository from '../../src/repositories/oauth_code'
import OAuthTokenRepository from '../../src/repositories/oauth_token'
import AuthService from '../../src/services/auth'
import OAuthUser from '../../src/models/oauth_user'
import OAuthClient from '../../src/models/oauth_client'
import OAuthToken from '../../src/models/oauth_token'
import OAuthCode from '../../src/models/oauth_code'
import OAuthService from '../../src/services/oauth/oauth'

jest.mock('../../src/repositories/oauth_user', () => require('../mocks/repositories/oauth_user'))
jest.mock('../../src/repositories/oauth_client', () => require('../mocks/repositories/oauth_client'))
jest.mock('../../src/repositories/oauth_code', () => require('../mocks/repositories/oauth_code'))
jest.mock('../../src/repositories/oauth_token', () => require('../mocks/repositories/oauth_token'))

function setup () {
  const userRepo = OAuthUserRepository()
  const clientRepo = OAuthClientRepository()
  const codeRepo = OAuthCodeRepository()
  const tokenRepo = OAuthTokenRepository()
  const authService = AuthService()

  const client = { id: 'object-id', clientId: 'client-id', clientSecret: 'client-secret' }
  const user = { id: 'object-id' }
  const scope = 'offline_access'

  return { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope }
}

describe('OAuthService', () => {
  describe('#OAuthService()', () => {
    const oauthService = OAuthService()
    expect(oauthService).toBeInstanceOf(Object)
  })

  describe('#generateAccessToken()', () => {
    it('should return an access token', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const accessToken = await oauthService.generateAccessToken(client, user, scope)

      expect(typeof accessToken).toBe('string')
      expect(accessToken.length).toBeGreaterThan(0)
    })

    it('should return an access token for client', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const accessToken = await oauthService.generateAccessToken(client, null, scope)

      expect(typeof accessToken).toBe('string')
      expect(accessToken.length).toBeGreaterThan(0)
    })
  })

  describe('#generateRefreshToken()', () => {
    it('should return a refresh token', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const refreshToken = await oauthService.generateRefreshToken(client, user, scope)

      expect(typeof refreshToken).toBe('string')
      expect(refreshToken.length).toBeGreaterThan(0)
    })
  })

  describe('#generateAuthorizationCode()', () => {
    it('should return an authorization code', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const authorizationCode = await oauthService.generateAuthorizationCode(client, user, scope)

      expect(typeof authorizationCode).toBe('string')
      expect(authorizationCode.length).toBeGreaterThan(0)
    })
  })

  describe('#getAccessToken()', () => {
    it('should get access token instance', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const accessToken = await oauthService.generateAccessToken(client, user, scope)
      const token = await oauthService.getAccessToken(accessToken)

      expect(token).toBeInstanceOf(OAuthToken)
    })
  })

  describe('#getRefreshToken()', () => {
    it('should get refresh token instance', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const refreshToken = await oauthService.generateRefreshToken(client, user, scope)
      const token = await oauthService.getRefreshToken(refreshToken)

      expect(token).toBeInstanceOf(OAuthToken)
    })
  })

  describe('#getAuthorizationCode()', () => {
    it('should get authorization code instance', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const authorizationCode = await oauthService.generateAuthorizationCode(client, user, scope)
      const authCode = await oauthService.getAuthorizationCode(authorizationCode)

      expect(authCode).toBeInstanceOf(OAuthCode)
    })
  })

  describe('#getClient()', () => {
    it('should get a client instance', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const client = await oauthService.getClient('client-id', 'client-secret')

      expect(client).toBeInstanceOf(OAuthClient)
    })
  })

  describe('#getUser()', () => {
    it('should get a user instance', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService } = setup()
      authService.authenticate = jest.fn(() => new OAuthUser())

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const user = await oauthService.getUser('username', 'password')

      expect(user).toBeInstanceOf(OAuthUser)
    })
  })

  describe('#getUserFromClient()', () => {
    it('should return null', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const user = await oauthService.getUserFromClient(client)

      expect(user).toBe(null)
    })
  })

  describe('#saveToken()', () => {
    it('should save access token and refresh token', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const accessToken = await oauthService.generateAccessToken(client, user, scope)
      const refreshToken = await oauthService.generateRefreshToken(client, user, scope)
      const token = { accessToken, refreshToken, scope }
      const result = await oauthService.saveToken(token, client, user)

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('accessTokenExpiresAt')
      expect(result).toHaveProperty('refreshToken')
      expect(result).toHaveProperty('refreshTokenExpiresAt')
      expect(result).toHaveProperty('client.id', client.id)
      expect(result).toHaveProperty('user.id', user.id)
      expect(result).toHaveProperty('scope', scope)
    })

    it('should only save access token if the refresh token did not provided', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const accessToken = await oauthService.generateAccessToken(client, user, scope)
      const token = { accessToken, scope }
      const result = await oauthService.saveToken(token, client, user)

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('accessTokenExpiresAt')
      expect(result).toHaveProperty('refreshToken', null)
      expect(result).toHaveProperty('refreshTokenExpiresAt', null)
      expect(result).toHaveProperty('client.id', client.id)
      expect(result).toHaveProperty('user.id', user.id)
      expect(result).toHaveProperty('scope', scope)
    })

    it('should only save access token for client', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const accessToken = await oauthService.generateAccessToken(client, user, scope)
      const token = { accessToken, scope }
      const result = await oauthService.saveToken(token, client, null)

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('accessTokenExpiresAt')
      expect(result).toHaveProperty('refreshToken', null)
      expect(result).toHaveProperty('refreshTokenExpiresAt', null)
      expect(result).toHaveProperty('client.id', client.id)
      expect(result).toHaveProperty('user.id', null)
      expect(result).toHaveProperty('scope', scope)
    })
  })

  describe('#saveAuthorizationCode()', () => {
    it('should save authorization code ', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const authorizationCode = await oauthService.generateAuthorizationCode(client, user, scope)
      const code = { authorizationCode, scope, redirectUri: 'http://example.com' }
      const result = await oauthService.saveAuthorizationCode(code, client, user)

      expect(result).toHaveProperty('authorizationCode')
      expect(result).toHaveProperty('expiresAt')
      expect(result).toHaveProperty('redirectUri')
      expect(result).toHaveProperty('scope')
      expect(result).toHaveProperty('client', client.id)
      expect(result).toHaveProperty('user', user.id)
      expect(result).toHaveProperty('scope', scope)
    })
  })

  describe('#revokeToken()', () => {
    it('should remove refresh token', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const refreshToken = await oauthService.generateRefreshToken(client, user, scope)
      const token = await oauthService.getRefreshToken(refreshToken)
      const removed = await oauthService.revokeToken(token)

      expect(removed).toBe(true)
    })
  })

  describe('#revokeAuthorizationCode()', () => {
    it('should', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const authorizationCode = await oauthService.generateAuthorizationCode(client, user, scope)
      const code = await oauthService.getAuthorizationCode(authorizationCode)
      const removed = await oauthService.revokeAuthorizationCode(code)

      expect(removed).toBe(true)
    })
  })

  describe('#validateScope()', () => {
    it('should return scope if the scope is valid', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const scope = await oauthService.validateScope(client, user, 'offline_access')

      expect(scope).toBe('offline_access')
    })

    it('should return empty if the scope is invalid', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const scope = await oauthService.validateScope(client, user, 'unknown')

      expect(scope).toBe('')
    })
  })

  describe('#verifyScope()', () => {
    it('should return true if scope of the token is valid', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const accessToken = await oauthService.generateAccessToken(client, user, scope)
      const token = await oauthService.getAccessToken(accessToken)
      token.scope = 'offline_access'
      const isValid = await oauthService.verifyScope(token, scope)

      expect(isValid).toBe(true)
    })

    it('should return false if scope of the token is invalid', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const accessToken = await oauthService.generateAccessToken(client, user, scope)
      const token = await oauthService.getAccessToken(accessToken)
      token.scope = 'unknown'
      const isValid = await oauthService.verifyScope(token, scope)

      expect(isValid).toBe(false)
    })

    it('should return false if scope of the token is missing', async () => {
      const { userRepo, clientRepo, tokenRepo, codeRepo, authService, client, user, scope } = setup()

      const oauthService = OAuthService({ userRepo, clientRepo, tokenRepo, codeRepo, authService })
      const accessToken = await oauthService.generateAccessToken(client, user, scope)
      const token = await oauthService.getAccessToken(accessToken)
      token.scope = null
      const isValid = await oauthService.verifyScope(token, scope)

      expect(isValid).toBe(false)
    })
  })
})

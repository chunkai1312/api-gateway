import OAuthClient from '../../src/models/oauth_client'
import OAuthToken from '../../src/models/oauth_token'
import OAuthCode from '../../src/models/oauth_code'
import OAuthUser from '../../src/models/oauth_user'
import AuthService from '../../src/services/auth'
import OAuthService from '../../src/services/oauth/oauth'

const mockOAuthClient = {
  getClient: jest.fn((clientId, clientSecret) => new OAuthClient())
}

const mockOAuthToken = {
  getAccessToken: jest.fn((accessToken) => new OAuthToken()),
  getRefreshToken: jest.fn((refreshToken) => new OAuthToken()),
  saveAccessToken: jest.fn((accessToken) => new OAuthToken()),
  saveRefreshToken: jest.fn((refreshToken) => new OAuthToken()),
  removeRefreshToken: jest.fn((refreshToken) => new OAuthToken())
}

const mockOAuthCode = {
  getAuthorizationCode: jest.fn((authorizationCode) => new OAuthCode()),
  saveAuthorizationCode: jest.fn((authCode) => new OAuthCode())
}

const mockAuthService = {
  authenticate: jest.fn((identifier, password) => new OAuthUser())
}

const dependencies = {
  OAuthClient: mockOAuthClient,
  OAuthCode: mockOAuthCode,
  OAuthToken: mockOAuthToken,
  authService: mockAuthService
}

function setup () {
  const client = { id: 'object-id', clientId: 'client-id', clientSecret: 'client-secret' }
  const user = { id: 'object-id' }
  const scope = 'offline_access'

  return { client, user, scope }
}

describe('OAuthService', () => {
  describe('#generateAccessToken()', () => {
    it('should return an access token', async () => {
      const { client, user, scope } = setup()

      const oauthService = OAuthService(dependencies)
      const accessToken = await oauthService.generateAccessToken(client, user, scope)

      expect(typeof accessToken).toBe('string')
      expect(accessToken.length).toBeGreaterThan(0)
    })
  })

  describe('#generateRefreshToken()', () => {
    it('should return a refresh token', async () => {
      const { client, user, scope } = setup()

      const oauthService = OAuthService(dependencies)
      const refreshToken = await oauthService.generateRefreshToken(client, user, scope)

      expect(typeof refreshToken).toBe('string')
      expect(refreshToken.length).toBeGreaterThan(0)
    })
  })

  describe('#generateAuthorizationCode()', () => {
    it('should return an authorization code', async () => {
      const { client, user, scope } = setup()

      const oauthService = OAuthService(dependencies)
      const authorizationCode = await oauthService.generateAuthorizationCode(client, user, scope)

      expect(typeof authorizationCode).toBe('string')
      expect(authorizationCode.length).toBeGreaterThan(0)
    })
  })

  describe('#getAccessToken()', () => {
    it('should get access token instance', async () => {
      const { client, user, scope } = setup()

      const oauthService = OAuthService(dependencies)
      const accessToken = await oauthService.generateAccessToken(client, user, scope)
      const token = await oauthService.getAccessToken(accessToken)

      expect(token).toBeInstanceOf(OAuthToken)
    })
  })

  describe('#getRefreshToken()', () => {
    it('should get refresh token instance', async () => {
      const { client, user, scope } = setup()

      const oauthService = OAuthService(dependencies)
      const refreshToken = await oauthService.generateRefreshToken(client, user, scope)
      const token = await oauthService.getRefreshToken(refreshToken)

      expect(token).toBeInstanceOf(OAuthToken)
    })
  })

  describe('#getAuthorizationCode()', () => {
    it('should get authorization code instance', async () => {
      const { client, user, scope } = setup()

      const oauthService = OAuthService(dependencies)
      const authorizationCode = await oauthService.generateAuthorizationCode(client, user, scope)
      const authCode = await oauthService.getAuthorizationCode(authorizationCode)

      expect(authCode).toBeInstanceOf(OAuthCode)
    })
  })

  describe('#getClient()', () => {
    it('should get a client instance', async () => {
      const oauthService = OAuthService(dependencies)
      const client = await oauthService.getClient('client-id', 'client-secret')

      expect(client).toBeInstanceOf(OAuthClient)
    })
  })

  describe('#getUser()', () => {
    it('should get a user instance', async () => {
      const oauthService = OAuthService(dependencies)
      const user = await oauthService.getUser('username', 'password')

      expect(user).toBeInstanceOf(OAuthUser)
    })
  })

  describe('#getUserFromClient()', () => {
    it('should return null', async () => {
      const { client } = setup()

      const oauthService = OAuthService(dependencies)
      const user = await oauthService.getUserFromClient(client)

      expect(user).toBe(null)
    })
  })

  describe('#saveToken()', () => {
    it('should save access token and refresh token', async () => {
      const { client, user, scope } = setup()

      const oauthService = OAuthService(dependencies)
      const accessToken = await oauthService.generateAccessToken(client, user, scope)
      const refreshToken = await oauthService.generateRefreshToken(client, user, scope)
      const token = { accessToken, refreshToken, scope }
      const result = await oauthService.saveToken(token, client, user)

      expect(result).toBeInstanceOf(Object)
      expect(typeof result.accessToken).toBe('string')
      expect(typeof result.accessTokenExpiresAt).toBe('number')
      expect(typeof result.refreshToken).toBe('string')
      expect(typeof result.refreshTokenExpiresAt).toBe('number')
      expect(typeof result.client).toBe('object')
      expect(typeof result.user).toBe('object')
      expect(typeof result.scope).toBe('string')
      expect(result.client.id).toBe(user.id)
      expect(result.user.id).toBe(client.id)
      expect(result.scope).toBe(scope)
    })
  })

  describe('#saveAuthorizationCode()', () => {
    it('should save authorization code ', async () => {
      const { client, user, scope } = setup()

      const oauthService = OAuthService(dependencies)
      const authorizationCode = await oauthService.generateAuthorizationCode(client, user, scope)
      const code = { authorizationCode, scope, redirectUri: 'http://example.com' }
      const result = await oauthService.saveAuthorizationCode(code, client, user)

      expect(result).toBeInstanceOf(Object)
      expect(typeof result.authorizationCode).toBe('string')
      expect(typeof result.expiresAt).toBe('number')
      expect(typeof result.redirectUri).toBe('string')
      expect(typeof result.scope).toBe('string')
      expect(typeof result.client).toBe('string')
      expect(typeof result.user).toBe('string')
      expect(result.client).toBe(user.id)
      expect(result.user).toBe(client.id)
      expect(result.scope).toBe(scope)
    })
  })

  describe('#revokeToken()', () => {
    it('should remove refresh token', async () => {
      const { client, user, scope } = setup()

      const oauthService = OAuthService(dependencies)
      const refreshToken = await oauthService.generateRefreshToken(client, user, scope)
      const removed = await oauthService.revokeToken(refreshToken)

      expect(removed).toBe(true)
    })
  })

  describe('#revokeAuthorizationCode()', () => {
    it('should', async () => {

    })
  })

  describe('#validateScope()', () => {
    it('should', async () => {

    })
  })

  describe('#verifyScope()', () => {
    it('should', async () => {

    })
  })
})

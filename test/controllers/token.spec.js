import httpMocks from 'node-mocks-http'
import OAuthService from '../../src/services/oauth/oauth'
import TokenController from '../../src/controllers/api/token'

jest.mock('../../src/repositories/oauth_token', () => require('../mocks/repositories/oauth_token'))

function setup () {
  const oauthService = OAuthService()
  oauthService.getAccessToken = jest.fn(() => ({
    client: 'client-id',
    user: 'user-id',
    scope: 'offline_access',
    expiresAt: Date.now()
  }))
  oauthService.getRefreshToken = jest.fn(() => ({
    client: 'client-id',
    user: 'user-id',
    scope: 'offline_access',
    expiresAt: Date.now()
  }))

  return { oauthService }
}

describe('TokenController', () => {
  describe('#TokenController()', () => {
    it('should create a TokenController', () => {
      const tokenController = TokenController()
      expect(tokenController).toBeInstanceOf(Object)
    })
  })

  describe('#info()', () => {
    it('should respond 200 with token info', async () => {
      const { oauthService } = setup()

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/oauth2/token/info',
        query: { access_token: 'access-token' }
      })
      const res = httpMocks.createResponse()

      const tokenController = TokenController({ oauthService })
      await tokenController.info(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(res._isJSON()).toBe(true)

      const data = JSON.parse(res._getData())
      expect(data.audience).toBe('client-id')
      expect(data.user_id).toBe('user-id')
      expect(data.scope).toBe('offline_access')
    })

    it('should respond 400 when the access token is invalid', async () => {
      const { oauthService } = setup()
      oauthService.getAccessToken = jest.fn(() => { throw new Error() })

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/oauth2/token/info',
        query: { access_token: 'invalid-access-token' }
      })
      const res = httpMocks.createResponse()

      const tokenController = TokenController({ oauthService })
      await tokenController.info(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(res._isJSON()).toBe(true)
    })
  })

  describe('#revoke()', () => {
    it('should respond 200', async () => {
      const { oauthService } = setup()

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/oauth2/token/revoke',
        query: { token: 'token' }
      })
      const res = httpMocks.createResponse()

      const tokenController = TokenController({ oauthService })
      await tokenController.revoke(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(res._isJSON()).toBe(true)
    })

    it('should respond 400 when the token is invalid', async () => {
      const { oauthService } = setup()
      oauthService.getRefreshToken = jest.fn(() => { throw new Error() })

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/oauth2/token/revoke',
        query: { token: 'token' }
      })
      const res = httpMocks.createResponse()

      const tokenController = TokenController({ oauthService })
      await tokenController.revoke(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(res._isJSON()).toBe(true)
    })
  })
})

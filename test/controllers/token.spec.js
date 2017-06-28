import httpMocks from 'node-mocks-http'
import TokenController from '../../src/controllers/api/token'

const mockOAuthService = {
  getAccessToken: jest.fn(() => {
    return {
      client: 'client-id',
      user: 'user-id',
      scope: 'offline_access',
      expiresAt: Date.now()
    }
  }),
  getRefreshToken: jest.fn(() => {
    return {
      client: 'client-id',
      user: 'user-id',
      scope: 'offline_access',
      expiresAt: Date.now()
    }
  }),
  revokeToken: jest.fn()
}

describe('TokenController', () => {
  describe('#info()', () => {
    it('should respond 200 with token info', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/oauth/token/info',
        query: { access_token: 'access-token' }
      })
      const res = httpMocks.createResponse()

      const tokenController = TokenController({ oauthService: mockOAuthService })
      await tokenController.info(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(res._isJSON()).toBe(true)

      const data = JSON.parse(res._getData())
      expect(data.audience).toBe('client-id')
      expect(data.user_id).toBe('user-id')
      expect(data.scope).toBe('offline_access')
    })

    it('should respond 400 when the access token is invalid', async () => {
      mockOAuthService.getAccessToken = jest.fn(() => {
        throw new Error()
      })

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/oauth/token/info',
        query: { access_token: 'invalid-access-token' }
      })
      const res = httpMocks.createResponse()

      const tokenController = TokenController({ oauthService: mockOAuthService })
      await tokenController.info(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(res._isJSON()).toBe(true)
    })
  })

  describe('#revoke()', () => {
    it('should respond 200', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/oauth/token/revoke',
        query: { token: 'token' }
      })
      const res = httpMocks.createResponse()

      const tokenController = TokenController({ oauthService: mockOAuthService })
      await tokenController.revoke(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(res._isJSON()).toBe(true)
    })

    it('should respond 400 when the token is invalid', async () => {
      mockOAuthService.getRefreshToken = jest.fn(() => {
        throw new Error()
      })

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/oauth/token/revoke',
        query: { token: 'token' }
      })
      const res = httpMocks.createResponse()

      const tokenController = TokenController({ oauthService: mockOAuthService })
      await tokenController.revoke(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(res._isJSON()).toBe(true)
    })
  })
})

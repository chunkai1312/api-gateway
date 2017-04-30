import request from 'supertest'
import { Types } from 'mongoose'
import app from '../../src/app'
import OAuthToken, { types, createToken } from '../../src/models/oauth_token'

describe('Token API:', () => {
  beforeAll(async () => {
    await OAuthToken.remove()
  })

  afterAll(async () => {
    await OAuthToken.remove()
  })

  describe('GET /oauth2/token/info', () => {
    it('should respond error when the requested token is invalid', async () => {
      return request(app)
        .get('/oauth2/token/info?access_token=1234567890')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body.error).toBe('invalid_token')
        })
    })

    it('should respond 200 with token info', async () => {
      const token = createToken({ subject: 'userid', expiresIn: 3600 })
      const payload = { user: new Types.ObjectId(), clientId: 'clientid', scope: '' }
      await OAuthToken.saveToken(token, types.ACCESS_TOKEN, payload)

      return request(app)
        .get(`/oauth2/token/info?access_token=${token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.audience).toBe(payload.clientId)
          expect(res.body.user_id).toBe(payload.user.toString())
          expect(res.body.scope).toBe(payload.scope)
          expect(res.body.expires_in).toBeLessThanOrEqual(3600)
        })
    })
  })

  describe('GET /oauth2/token/revoke', () => {
    it('should respond error when the requested token is invalid', async () => {
      return request(app)
        .get('/oauth2/token/revoke?access_token=1234567890')
        .expect('Content-Type', /json/)
        .expect(400)
        .then(res => {
          expect(res.body.error).toBe('invalid_token')
        })
    })

    it('should respond 200 with access token revoked successfully', async () => {
      const token = createToken({ subject: 'userid', expiresIn: 3600 })
      const payload = { user: new Types.ObjectId(), clientId: 'clientid', scope: '' }
      await OAuthToken.saveToken(token, types.ACCESS_TOKEN, payload)

      return request(app)
        .get(`/oauth2/token/revoke?token=${token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toEqual({})
        })
    })

    it('should respond 200 with refresh token revoked successfully', async () => {
      const token = createToken({ subject: 'userid', expiresIn: 3600 })
      const payload = { user: new Types.ObjectId(), clientId: 'clientid', scope: '' }
      await OAuthToken.saveToken(token, types.REFRESH_TOKEN, payload)

      return request(app)
        .get(`/oauth2/token/revoke?token=${token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).toEqual({})
        })
    })
  })
})

import connectMongoDB from '../../src/config/mongoose'
import OAuthToken, { types } from '../../src/models/oauth_token'
// import tokens from '../fixtures/oauth_tokens.json'

connectMongoDB()

describe('OAuthToken Model:', () => {
  const tokens = [
    { type: 'AUTHORIZATION_CODE', jti: 'dd8b1cf1-0fc2-4294-b6fb-24c2fe07286c' },
    { type: 'ACCESS_TOKEN', jti: '316cc09e-ea84-477a-aa04-f46e61369041' },
    { type: 'REFRESH_TOKEN', jti: '1044b768-d9cf-4913-b687-ae9f990ae260' }
  ]

  beforeAll(async () => {
    await OAuthToken.remove()
    await OAuthToken.create(tokens)
  })

  afterAll(async () => {
    await OAuthToken.remove()
  })

  describe('OAuthClientSchema.statics', () => {
    describe('#isExist()', () => {
      it('should throw error if the token type is invalid', async () => {
        let value, error
        try {
          value = await OAuthToken.isExist('unknown', 'blah')
        } catch (err) {
          error = err
        } finally {
          expect(value).toBeUndefined()
          expect(error).toBeDefined()
        }
      })

      it('should be true if the token of authorization code is exist', async () => {
        const isExist = await OAuthToken.isExist(types.AUTHORIZATION_CODE, 'dd8b1cf1-0fc2-4294-b6fb-24c2fe07286c')
        expect(isExist).toBe(true)
      })

      it('should be false if the token of authorization code is not exist', async () => {
        const isExist = await OAuthToken.isExist(types.AUTHORIZATION_CODE, 'blah')
        expect(isExist).toBe(false)
      })

      it('should be true if the token of access toke is exist', async () => {
        const isExist = await OAuthToken.isExist(types.ACCESS_TOKEN, '316cc09e-ea84-477a-aa04-f46e61369041')
        expect(isExist).toBe(true)
      })

      it('should be false if the token of access toke is not exist', async () => {
        const isExist = await OAuthToken.isExist(types.ACCESS_TOKEN, 'blah')
        expect(isExist).toBe(false)
      })

      it('should be true if the token of refresh token is exist', async () => {
        const isExist = await OAuthToken.isExist(types.REFRESH_TOKEN, '1044b768-d9cf-4913-b687-ae9f990ae260')
        expect(isExist).toBe(true)
      })

      it('should be false if the token of refresh token is not exist', async () => {
        const isExist = await OAuthToken.isExist(types.REFRESH_TOKEN, 'blah')
        expect(isExist).toBe(false)
      })
    })
  })
})

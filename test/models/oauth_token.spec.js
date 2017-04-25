import mongoose from 'mongoose'
import uuid from 'uuid/v4'
import jwt from 'jsonwebtoken'
import connectMongoDB from '../../src/config/mongoose'
import OAuthToken, { types, createToken, verifyToken } from '../../src/models/oauth_token'
// import tokens from '../fixtures/oauth_tokens.json'

connectMongoDB()

describe('OAuthToken Model:', () => {
  const tokens = [
    { jwtId: 'dd8b1cf1-0fc2-4294-b6fb-24c2fe07286c', type: 'AUTHORIZATION_CODE' },
    { jwtId: '316cc09e-ea84-477a-aa04-f46e61369041', type: 'ACCESS_TOKEN' },
    { jwtId: '1044b768-d9cf-4913-b687-ae9f990ae260', type: 'REFRESH_TOKEN' }
  ]

  let authorizationCode
  let accessToken
  let refreshToken

  beforeAll(async () => {
    await OAuthToken.remove()
    // await OAuthToken.create(tokens)
  })

  afterAll(async () => {
    // await OAuthToken.remove()
  })

  describe('OAuthClientSchema.statics', () => {
    describe('#saveToken()', () => {
      it('should save token of AUTHORIZATION_CODE type', async () => {
        const payload = {
          user: new mongoose.Types.ObjectId(),
          clientId: uuid(),
          redirectURI: 'https://example.com/callback',
          scope: 'offline_access'
        }
        authorizationCode = createToken({ subject: payload.user.toString(), expiresIn: '5m' })
        const token = await OAuthToken.saveToken(authorizationCode, types.AUTHORIZATION_CODE, payload)
        expect(token).toBeDefined()
        expect(token.jwtId).toBe(jwt.decode(authorizationCode).jti)
        expect(token.type).toBe(types.AUTHORIZATION_CODE)
        expect(token.payload.toJSON()).toEqual(payload)
        expect(token.payload.toObject()).toEqual(payload)
      })

      it('should save token of ACCESS_TOKEN type', async () => {
        const payload = {
          user: new mongoose.Types.ObjectId(),
          clientId: uuid(),
          scope: 'offline_access'
        }
        accessToken = createToken({ subject: payload.user.toString(), expiresIn: '1h' })
        const token = await OAuthToken.saveToken(accessToken, types.ACCESS_TOKEN, payload)
        expect(token).toBeDefined()
        expect(token.jwtId).toBe(jwt.decode(accessToken).jti)
        expect(token.type).toBe(types.ACCESS_TOKEN)
        expect(token.payload.toJSON()).toEqual(payload)
        expect(token.payload.toObject()).toEqual(payload)
      })

      it('should save token of REFRESH_TOKEN type', async () => {
        const payload = {
          user: new mongoose.Types.ObjectId(),
          clientId: uuid(),
          scope: 'offline_access'
        }
        refreshToken = createToken({ subject: payload.user.toString(), expiresIn: '100y' })
        const token = await OAuthToken.saveToken(refreshToken, types.REFRESH_TOKEN, payload)
        expect(token).toBeDefined()
        expect(token.jwtId).toBe(jwt.decode(refreshToken).jti)
        expect(token.type).toBe(types.REFRESH_TOKEN)
        expect(token.payload.toJSON()).toEqual(payload)
        expect(token.payload.toObject()).toEqual(payload)
      })
    })

    describe('#findToken()', () => {
      it('should find authorizationCode', async () => {
        const token = await OAuthToken.findToken(authorizationCode)
        expect(token).toBeDefined()
        expect(token.jwtId).toBe(jwt.decode(authorizationCode).jti)
      })

      it('should find accessToken', async () => {
        const token = await OAuthToken.findToken(accessToken)
        expect(token).toBeDefined()
        expect(token.jwtId).toBe(jwt.decode(accessToken).jti)
      })

      it('should find refreshToken', async () => {
        const token = await OAuthToken.findToken(refreshToken)
        expect(token).toBeDefined()
        expect(token.jwtId).toBe(jwt.decode(refreshToken).jti)
      })
    })

    // describe('#removeToken()', () => {
    //   it('should remove authorizationCode', async () => {
    //     const removedToken = await OAuthToken.removeToken(authorizationCode)
    //     expect(removedToken).toBeDefined()
    //     expect(removedToken.jwtId).toBe(jwt.decode(authorizationCode).jti)

    //     const token = await OAuthToken.findToken(authorizationCode)
    //     expect(token).toBe(null)
    //   })

    //   it('should remove accessToken', async () => {
    //     const removedToken = await OAuthToken.removeToken(accessToken)
    //     expect(removedToken).toBeDefined()
    //     expect(removedToken.jwtId).toBe(jwt.decode(accessToken).jti)

    //     const token = await OAuthToken.findToken(accessToken)
    //     expect(token).toBe(null)
    //   })

    //   it('should remove refreshToken', async () => {
    //     const removedToken = await OAuthToken.removeToken(refreshToken)
    //     expect(removedToken).toBeDefined()
    //     expect(removedToken.jwtId).toBe(jwt.decode(refreshToken).jti)

    //     const token = await OAuthToken.findToken(refreshToken)
    //     expect(token).toBe(null)
      // })
    // })
  })
})

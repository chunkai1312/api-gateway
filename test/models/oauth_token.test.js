import { expect } from 'chai'
import co from 'co'
import { OAuthToken, OAuthClient, OAuthUser } from '../../src/models'
import connectMongoDB from '../../src/config/mongoose'
import config from '../../config'

connectMongoDB()

describe('OAuthToken Model:', () => {
  let client
  let user
  let tokenSeed
  let tokenWithNullRefreshTokenSeed

  before(() => {
    return co(function * () {
      client = yield OAuthClient.create({
        redirectURIs: ['https://www.example.com/callback'],
        name: 'Test Client'
      })
      user = yield OAuthUser.create({
        provider: client.id,
        username: 'test',
        password: 'password',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      })
      tokenSeed = {
        client: client.id,
        user: user.id,
        scope: ''
      }
      tokenWithNullRefreshTokenSeed = {
        refreshToken: null,
        client: client.id,
        user: user.id,
        scope: ''
      }
    })
  })

  after(() => {
    return Promise.all([client.remove(), user.remove()])
  })

  describe('OAuthTokenSchema.statics', () => {
    describe('#create()', () => {
      let token
      let tokenWithNullRefreshToken

      before(() => {
        return co(function * () {
          token = yield OAuthToken.create(tokenSeed)
          tokenWithNullRefreshToken = yield OAuthToken.create(tokenWithNullRefreshTokenSeed)
        })
      })

      after(() => {
        return Promise.all([token.remove(), tokenWithNullRefreshToken.remove()])
      })

      it('should return an OAuthToken with property accessToken', () => {
        expect(token).to.have.property('accessToken')
        expect(token.accessToken).to.have.length(config.oauth2.accessToken.length)
      })

      it('should return an OAuthToken with property refreshToken', () => {
        expect(token).to.have.property('refreshToken')
        expect(token.accessToken).to.have.length(config.oauth2.refreshToken.length)
      })

      it('should return an OAuthToken with property expiresAt', () => {
        expect(token).to.have.property('expiresAt')
        expect((token.expiresAt.getTime() - token.createdAt.getTime()) / 1000)
          .to.equal(config.oauth2.accessToken.expiresIn)
      })

      it('should return an OAuthToken with property refreshToken that is null', () => {
        expect(tokenWithNullRefreshToken).to.have.property('refreshToken')
        expect(tokenWithNullRefreshToken.refreshToken).to.equal(null)
      })
    })

    describe('#getByAccessToken()', () => {
      let token

      before(() => {
        return OAuthToken.create(tokenSeed).then((oauthToken) => {
          token = oauthToken
        })
      })

      after(() => {
        return token.remove()
      })

      it('should return an OAuthToken that is equal to find', () => {
        return OAuthToken.getByAccessToken(token.accessToken).then(oauthToken => {
          expect(oauthToken).to.exist
          expect(oauthToken.accessToken).to.equal(token.accessToken)
        })
      })
    })

    describe('#getByRefreshToken()', () => {
      let token

      before(() => {
        return OAuthToken.create(tokenSeed).then((oauthToken) => {
          token = oauthToken
        })
      })

      after(() => {
        return token.remove()
      })

      it('should return an OAuthToken that is equal to find', () => {
        return OAuthToken.getByRefreshToken(token.refreshToken).then(oauthToken => {
          expect(oauthToken).to.exist
          expect(oauthToken.refreshToken).to.equal(token.refreshToken)
        })
      })
    })
  })

  describe('OAuthTokenSchema.methods', () => {
    describe('#save()', () => {
      let token
      let tokenWithNullRefreshToken

      before(() => {
        return co(function * () {
          token = yield new OAuthToken(tokenSeed).save()
          tokenWithNullRefreshToken = yield new OAuthToken(tokenWithNullRefreshTokenSeed).save()
        })
      })

      after(() => {
        return Promise.all([token.remove(), tokenWithNullRefreshToken.remove()])
      })

      it('should return an OAuthToken with property accessToken', () => {
        expect(token).to.have.property('accessToken')
        expect(token.accessToken).to.have.length(config.oauth2.accessToken.length)
      })

      it('should return an OAuthToken with property refreshToken', () => {
        expect(token).to.have.property('refreshToken')
        expect(token.accessToken).to.have.length(config.oauth2.refreshToken.length)
      })

      it('should return an OAuthToken with property expiresAt', () => {
        expect(token).to.have.property('expiresAt')
        expect((token.expiresAt.getTime() - token.createdAt.getTime()) / 1000)
          .to.equal(config.oauth2.accessToken.expiresIn)
      })

      it('should return an OAuthToken with property refreshToken that is null', () => {
        expect(tokenWithNullRefreshToken).to.have.property('refreshToken')
        expect(tokenWithNullRefreshToken.refreshToken).to.equal(null)
      })
    })

    describe('#isValid()', () => {
      let token

      before(() => {
        return new OAuthToken(tokenSeed).save().then(oauthToken => {
          token = oauthToken
        })
      })

      after(() => {
        return token.remove()
      })

      it('should return true if accessToken is valid', () => {
        expect(token.isValid()).to.be.true
      })

      it('should return false if accessToken is invalid', () => {
        token.expiresAt = new Date()
        expect(token.isValid()).to.be.false
      })
    })

    describe('#getExpiresIn()', () => {
      let token

      before(() => {
        return new OAuthToken(tokenSeed).save().then(oauthToken => {
          token = oauthToken
        })
      })

      after(() => {
        return token.remove()
      })

      it('should return seconds for expiration', () => {
        const expiresIn = Math.floor((token.expiresAt.getTime() - Date.now()) / 1000)
        expect(token.getExpiresIn()).to.equal(expiresIn)
      })
    })
  })
})

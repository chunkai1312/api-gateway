import { expect } from 'chai'
import co from 'co'
import { OAuthCode, OAuthClient, OAuthUser } from '../../src/models'
import connectMongoDB from '../../src/config/mongoose'
import config from '../../config'

connectMongoDB()

describe('OAuthCode Model:', () => {
  let client
  let user
  let authCodeSeed

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
      authCodeSeed = {
        client: client.id,
        user: user.id,
        redirectURL: 'https://www.example.com/callback',
        scope: ''
      }
    })
  })

  after(() => {
    return Promise.all([client.remove(), user.remove()])
  })

  describe('OAuthCodeSchema.statics', () => {
    describe('#create()', () => {
      let authCode

      before(() => {
        return OAuthCode.create(authCodeSeed).then(oauthCode => {
          authCode = oauthCode
        })
      })

      after(() => {
        return authCode.remove()
      })

      it('should return an OAuthCode with property code', () => {
        expect(authCode).to.have.property('code')
        expect(authCode.code).to.have.length(config.oauth2.authorizationCode.length)
      })

      it('should return an OAuthCode with property expiresAt', () => {
        expect(authCode).to.have.property('expiresAt')
        expect((authCode.expiresAt.getTime() - authCode.createdAt.getTime()) / 1000)
          .to.equal(config.oauth2.authorizationCode.expiresIn)
      })
    })

    describe('#getByCode()', () => {
      let authCode

      before(() => {
        return OAuthCode.create(authCodeSeed).then(oauthCode => {
          authCode = oauthCode
        })
      })

      after(() => {
        return authCode.remove()
      })

      it('should return an OAuthCode that is equal to find', () => {
        return OAuthCode.getByCode(authCode.code).then(oauthCode => {
          expect(oauthCode).to.exist
          expect(oauthCode.code).to.equal(authCode.code)
        })
      })
    })
  })

  describe('OAuthCodeSchema.methods', () => {
    describe('#save()', () => {
      let authCode

      before(() => {
        return new OAuthCode(authCodeSeed).save().then(oauthCode => {
          authCode = oauthCode
        })
      })

      after(() => {
        return authCode.remove()
      })

      it('should return an OAuthCode with property code', () => {
        expect(authCode).to.have.property('code')
        expect(authCode.code).to.have.length(config.oauth2.authorizationCode.length)
      })

      it('should return an OAuthCode with property expiresAt', () => {
        expect(authCode).to.have.property('expiresAt')
        expect((authCode.expiresAt.getTime() - authCode.createdAt.getTime()) / 1000)
          .to.equal(config.oauth2.authorizationCode.expiresIn)
      })
    })

    describe('#isValid()', () => {
      let authCode

      before(() => {
        return new OAuthCode(authCodeSeed).save().then(oauthCode => {
          authCode = oauthCode
        })
      })

      after(() => {
        return authCode.remove()
      })

      it('should return true if code is valid', () => {
        expect(authCode.isValid()).to.be.true
      })

      it('should return false if code is invalid', () => {
        authCode.expiresAt = new Date()
        expect(authCode.isValid()).to.be.false
      })
    })

    describe('#verify()', () => {
      let authCode

      before(() => {
        return new OAuthCode(authCodeSeed).save().then(oauthCode => {
          authCode = oauthCode
        })
      })

      after(() => {
        return authCode.remove()
      })

      it('should return true if inputs are valid', () => {
        expect(authCode.verify(authCode.client, authCode.redirectURL)).to.be.true
      })

      it('should return false if inputs are invalid', () => {
        expect(authCode.verify('foo', 'bar')).to.be.false
      })

      it('should return false if clientId is invalid', () => {
        expect(authCode.verify('blah', authCode.redirectURL)).to.be.false
      })

      it('should return false if redirectURI is invalid', () => {
        expect(authCode.verify(authCode.client, 'blah')).to.be.false
      })

      it('should return false if code has expired', () => {
        authCode.expiresAt = new Date()
        expect(authCode.verify(authCode.client, 'blah')).to.be.false
      })
    })
  })
})

import { expect } from 'chai'
import co from 'co'
import { OAuthUser, OAuthClient } from '../../app/models'
import connectMongoDB from '../../src/config/mongoose'

connectMongoDB()

describe('OAuthUser Model:', () => {
  let client
  let userSeed

  before(() => {
    return co(function * () {
      client = yield OAuthClient.create({
        redirectURIs: ['https://www.example.com/callback'],
        name: 'Test Client'
      })
      userSeed = {
        provider: client.id,
        username: 'test',
        password: 'password',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordResetToken: 'qwertyuiopasdfgh',
        passwordResetExpires: Date.now() + 3600 * 1000
      }
    })
  })

  after(() => {
    return client.remove()
  })

  describe('OAuthUserSchema.statics', () => {
    describe('#create()', () => {
      let user

      before(() => {
        return OAuthUser.create(userSeed).then(oauthUser => {
          user = oauthUser
        })
      })

      after(() => {
        return user.remove()
      })

      it('should return an OAuthUser with hashed password', () => {
        expect(user.password).to.not.equal('password')
      })

      it('should include hash in hashed password', () => {
        expect(JSON.parse(user.password)).to.have.property('hash')
      })

      it('should include salt in hashed password', () => {
        expect(JSON.parse(user.password)).to.have.property('salt')
      })
    })

    describe('#getByUsername()', () => {
      let user

      before(() => {
        return OAuthUser.create(userSeed).then(oauthUser => {
          user = oauthUser
        })
      })

      after(() => {
        return user.remove()
      })

      it('should return an OAuthUser that is equal to get', () => {
        return OAuthUser.getByUsername('test').then(oauthUser => {
          expect(oauthUser).to.exist
          expect(oauthUser.username).to.equal('test')
        })
      })
    })

    describe('#getByEmail()', () => {
      let user

      before(() => {
        return OAuthUser.create(userSeed).then(oauthUser => {
          user = oauthUser
        })
      })

      after(() => {
        return user.remove()
      })

      it('should return an OAuthUser that is equal to get', () => {
        return OAuthUser.getByEmail('test@example.com').then(oauthUser => {
          expect(oauthUser).to.exist
          expect(oauthUser.email).to.equal('test@example.com')
        })
      })
    })

    describe('#getByUsernameOrEmail()', () => {
      let user

      before(() => {
        return OAuthUser.create(userSeed).then(oauthUser => {
          user = oauthUser
        })
      })

      after(() => {
        return user.remove()
      })

      it('should return an OAuthUser when the username exists', () => {
        return OAuthUser.getByUsernameOrEmail('test').then(oauthUser => {
          expect(oauthUser).to.exist
          expect(oauthUser.username).to.equal('test')
        })
      })

      it('should return an OAuthUser when the email exists', () => {
        return OAuthUser.getByUsernameOrEmail('test@example.com').then(oauthUser => {
          expect(oauthUser).to.exist
          expect(oauthUser.email).to.equal('test@example.com')
        })
      })
    })

    describe('#getByPasswordResetToken()', () => {
      let user

      before(() => {
        return OAuthUser.create(userSeed).then(oauthUser => {
          user = oauthUser
        })
      })

      after(() => {
        return user.remove()
      })

      it('should return an OAuthUser that is equal to get', () => {
        return OAuthUser.getByPasswordResetToken('qwertyuiopasdfgh').then(oauthUser => {
          expect(oauthUser).to.exist
          expect(oauthUser.passwordResetToken).to.equal('qwertyuiopasdfgh')
          expect(oauthUser.passwordResetExpires).to.above(Date.now())
        })
      })
    })
  })

  describe('OAuthUserSchema.methods', () => {
    describe('#save()', () => {
      let user

      before(() => {
        return new OAuthUser(userSeed).save().then(oauthUser => {
          user = oauthUser
        })
      })

      after(() => {
        return user.remove()
      })

      it('should return an OAuthUser with hashed password', () => {
        expect(user.password).to.not.equal('password')
      })

      it('should include hash in hashed password', () => {
        expect(JSON.parse(user.password)).to.have.property('hash')
      })

      it('should include salt in hashed password', () => {
        expect(JSON.parse(user.password)).to.have.property('salt')
      })
    })

    describe('#authenticate()', () => {
      let user

      before(() => {
        return new OAuthUser(userSeed).save().then(oauthUser => {
          user = oauthUser
        })
      })

      after(() => {
        return user.remove()
      })

      it('should return true if password is valid', () => {
        return user.authenticate('password').then((isAuthenticated) => {
          expect(isAuthenticated).to.be.true
        })
      })

      it('should return false if password is invalid', () => {
        return user.authenticate('blah').then((isAuthenticated) => {
          expect(isAuthenticated).to.be.false
        })
      })
    })

    describe('#changePassword()', () => {
      let user

      before(() => {
        return new OAuthUser(userSeed).save().then(oauthUser => {
          user = oauthUser
          return user.changePassword('password', 'new')
        })
      })

      after(() => {
        return user.remove()
      })

      it('should return an OAuthUser with new hashed password', () => {
        expect(user.password).to.not.equal('password')
        expect(user.password).to.not.equal('new')
      })

      it('should include hash in new hashed password', () => {
        expect(JSON.parse(user.password)).to.have.property('hash')
      })

      it('should include salt in new hashed password', () => {
        expect(JSON.parse(user.password)).to.have.property('salt')
      })

      it('should return true if new password is valid', () => {
        return user.authenticate('new').then((isAuthenticated) => {
          expect(isAuthenticated).to.be.true
        })
      })

      it('should return false if new password is invalid', () => {
        return user.authenticate('password').then((isAuthenticated) => {
          expect(isAuthenticated).to.be.false
        })
      })

      it('should return false if old password is invalid', () => {
        user.changePassword('password', 'blah').then((res) => {
          return expect(res).to.be.false
        })
      })
    })

    describe('#generatePasswordResetToken()', () => {
      let user
      let passwordResetToken
      let passwordResetExpires

      before(() => {
        return new OAuthUser(userSeed).save().then(oauthUser => {
          user = oauthUser
        })
      })

      after(() => {
        return user.remove()
      })

      it('should generate password reset token', () => {
        return user.generatePasswordResetToken().then(() => {
          passwordResetToken = user.passwordResetToken
          passwordResetExpires = user.passwordResetExpires
          expect(user.passwordResetToken).to.exist
          expect(user.passwordResetExpires).to.exist
        })
      })

      it('should generate new password reset token', () => {
        return user.generatePasswordResetToken().then(() => {
          expect(user.passwordResetToken).to.not.equal(passwordResetToken)
          expect(user.passwordResetExpires).to.not.equal(passwordResetExpires)
        })
      })
    })
  })
})

import connectMongoDB from '../../src/config/mongoose'
import OAuthUser from '../../src/models/oauth_user'

connectMongoDB()

describe('OAuthUser Model:', () => {
  const testUser = { username: 'test', password: '123qwe', email: 'test@example.com' }

  beforeEach(async () => {
    await OAuthUser.remove()
  })

  afterEach(async () => {
    await OAuthUser.remove()
  })

  describe('OAuthUserSchema.statics', () => {
    describe('#create()', () => {
      it('should return an OAuthUser with hashed password', async () => {
        const user = await OAuthUser.create(testUser)
        expect(user.password).not.toBe(testUser.password)
      })

      it('should include hash in hashed password', async () => {
        const user = await OAuthUser.create(testUser)
        expect(JSON.parse(user.password)).toHaveProperty('hash')
      })

      it('should include salt in hashed password', async () => {
        const user = await OAuthUser.create(testUser)
        expect(JSON.parse(user.password)).toHaveProperty('salt')
      })
    })

    describe('#findByUsername()', () => {
      it('should return an OAuthUser that is equal to get', async () => {
        await OAuthUser.create(testUser)
        const user = await OAuthUser.findByUsername('test')
        expect(user).toBeDefined()
        expect(user.username).toBe('test')
      })
    })

    describe('#findByEmail()', () => {
      it('should return an OAuthUser that is equal to get', async () => {
        await OAuthUser.create(testUser)
        const user = await OAuthUser.findByEmail('test@example.com')
        expect(user).toBeDefined()
        expect(user.email).toBe('test@example.com')
      })
    })

    describe('#findByUsernameOrEmail()', () => {
      it('should return an OAuthUser when the username exists', async () => {
        await OAuthUser.create(testUser)
        const user = await OAuthUser.findByUsernameOrEmail('test')
        expect(user).toBeDefined()
        expect(user.username).toBe('test')
      })

      it('should return an OAuthUser when the email exists', async () => {
        await OAuthUser.create(testUser)
        const user = await OAuthUser.findByUsernameOrEmail('test@example.com')
        expect(user).toBeDefined()
        expect(user.email).toBe('test@example.com')
      })
    })
  })

  describe('OAuthUserSchema.methods', () => {
    describe('#save()', () => {
      it('should return an OAuthUser with hashed password', async () => {
        const user = await new OAuthUser(testUser).save()
        expect(user.password).not.toBe('password')
      })

      it('should include hash in hashed password', async () => {
        const user = await new OAuthUser(testUser).save()
        expect(JSON.parse(user.password)).toHaveProperty('hash')
      })

      it('should include salt in hashed password', async () => {
        const user = await new OAuthUser(testUser).save()
        expect(JSON.parse(user.password)).toHaveProperty('salt')
      })
    })

    describe('#authenticate()', () => {
      it('should return true if password is valid', async () => {
        const user = await new OAuthUser(testUser).save()
        const isAuthenticated = await user.authenticate('123qwe')
        expect(isAuthenticated).toBe(true)
      })

      it('should return false if password is invalid', async () => {
        const user = await new OAuthUser(testUser).save()
        const isAuthenticated = await user.authenticate('blah')
        expect(isAuthenticated).toBe(false)
      })
    })

    describe('#changePassword()', () => {
      it('should return true', async () => {
        const user = await new OAuthUser(testUser).save()
        const newPassword = await user.changePassword('123qwe', 'new')
        expect(newPassword).toBe(true)
      })

      it('should return false if old password is invalid', async () => {
        const user = await new OAuthUser(testUser).save()
        const newPassword = await user.changePassword('error', 'new')
        expect(newPassword).toBe(false)
      })
    })
  })
})

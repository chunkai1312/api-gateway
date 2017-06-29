import AuthService from '../../src/services/auth'

function setup () {
  const pw = {
    hash: jest.fn(() => Promise.resolve('hashed password')),
    verify: jest.fn(() => Promise.resolve(true))
  }

  const mailer = {
    sendPasswordResetEmail: jest.fn()
  }

  const OAuthUser = {
    createUser: jest.fn(() => Promise.resolve({})),
    getUser: jest.fn(() => Promise.resolve({})),
    getUserByPasswordResetToken: jest.fn(() => Promise.resolve({})),
    save: jest.fn()
  }

  return { pw, mailer, OAuthUser }
}

describe('AuthService', () => {
  describe('#createUser()', () => {
    it('should create a new user', async () => {
      const { pw, mailer, OAuthUser } = setup()

      const authService = AuthService({ pw, mailer, OAuthUser })
      const data = {
        firstName: 'Test',
        lastName: 'User',
        username: 'test',
        email: 'test@example.com',
        password: '123qwe'
      }
      await authService.createUser(data)

      expect(pw.hash).toHaveBeenCalled()
      expect(OAuthUser.createUser).toHaveBeenCalled()
    })
  })

  describe('#authenticate()', () => {
    it('should return a user instance when authenticated', async () => {
      const { pw, mailer, OAuthUser } = setup()

      const authService = AuthService({ pw, mailer, OAuthUser })
      await authService.authenticate('username', 'password')

      expect(OAuthUser.getUser).toHaveBeenCalled()
      expect(pw.verify).toHaveBeenCalled()
    })

    it('should return null when authenticated', async () => {
      const { pw, mailer, OAuthUser } = setup()
      pw.verify = jest.fn(() => Promise.resolve(false))

      const authService = AuthService({ pw, mailer, OAuthUser })
      const user = await authService.authenticate('username', 'password')

      expect(OAuthUser.getUser).toHaveBeenCalled()
      expect(pw.verify).toHaveBeenCalled()
      expect(user).toBe(null)
    })
  })

  describe('#forgotPassword()', () => {
    it('should send password reset email and return a user instance when the email address was found', async () => {
      const { pw, mailer, OAuthUser } = setup()

      const authService = AuthService({ pw, mailer, OAuthUser })
      await authService.forgotPassword('test@example.com')

      expect(mailer.sendPasswordResetEmail).toHaveBeenCalled()
    })

    it('should return null when the email address was not found', async () => {
      const { pw, mailer, OAuthUser } = setup()
      OAuthUser.getUser = jest.fn((identifier) => null)

      const authService = AuthService({ pw, mailer, OAuthUser })
      const user = await authService.forgotPassword('test@example.com')
      expect(user).toBe(null)
    })
  })

  describe('#validatePasswordResetToken()', () => {
    it('should return a user instance when the password reset token is valid', async () => {
      const { pw, mailer, OAuthUser } = setup()

      const authService = AuthService({ pw, mailer, OAuthUser })
      await authService.validatePasswordResetToken('password-rest-token')

      expect(OAuthUser.getUserByPasswordResetToken).toHaveBeenCalled()
    })

    it('should return null when the password reset token is invalid', async () => {
      const { pw, mailer, OAuthUser } = setup()
      OAuthUser.getUserByPasswordResetToken = jest.fn((token) => null)

      const authService = AuthService({ pw, mailer, OAuthUser })
      const user = await authService.validatePasswordResetToken('password-rest-token')

      expect(user).toBe(null)
    })
  })

  describe('#resetPassword()', () => {
    it('should change password and return a user instance when the password reset token is valid', async () => {
      const { pw, mailer, OAuthUser } = setup()

      const authService = AuthService({ pw, mailer, OAuthUser })
      await authService.resetPassword('password-rest-token', 'new-password')

      expect(pw.hash).toHaveBeenCalled()
    })

    it('should return null when the password reset token is invalid', async () => {
      const { pw, mailer, OAuthUser } = setup()
      OAuthUser.getUserByPasswordResetToken = jest.fn((token) => null)

      const authService = AuthService({ pw, mailer, OAuthUser })
      const user = await authService.resetPassword('password-rest-token', 'new-password')

      expect(user).toBe(null)
    })
  })
})

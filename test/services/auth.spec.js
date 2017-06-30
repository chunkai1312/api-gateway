import credential from 'credential'
import MailerService from '../../src/services/mailer'
import OAuthUserRepository from '../../src/repositories/oauth_user'
import OAuthUser from '../../src/models/oauth_user'
import AuthService from '../../src/services/auth'

jest.mock('../../src/repositories/oauth_user', () => require('../mocks/repositories/oauth_user'))

function setup () {
  const pw = credential()
  const mailer = MailerService()
  const userRepo = OAuthUserRepository()

  return { pw, mailer, userRepo }
}

describe('AuthService', () => {
  describe('#AuthService()', () => {
    it('should create an AuthService', () => {
      const authService = AuthService()
      expect(authService).toBeInstanceOf(Object)
    })
  })

  describe('#createUser()', () => {
    it('should create a new user', async () => {
      const { pw, mailer, userRepo } = setup()
      pw.hash = jest.fn(() => Promise.resolve('hashed-password'))

      const authService = AuthService({ pw, mailer, userRepo })
      const data = {
        firstName: 'Test',
        lastName: 'User',
        username: 'test',
        email: 'test@example.com',
        password: '123qwe'
      }
      const user = await authService.createUser(data)

      expect(pw.hash).toHaveBeenCalled()
      expect(user).toBeInstanceOf(OAuthUser)
    })
  })

  describe('#authenticate()', () => {
    it('should return a user instance when authenticated', async () => {
      const { pw, mailer, userRepo } = setup()
      pw.verify = jest.fn(() => Promise.resolve(true))

      const authService = AuthService({ pw, mailer, userRepo })
      const user = await authService.authenticate('username', 'password')

      expect(pw.verify).toHaveBeenCalled()
      expect(user).toBeInstanceOf(OAuthUser)
    })

    it('should return null if the user was not found', async () => {
      const { pw, mailer, userRepo } = setup()
      userRepo.getUser = jest.fn(() => Promise.resolve(null))

      const authService = AuthService({ pw, mailer, userRepo })
      const user = await authService.authenticate('username', 'password')

      expect(user).toBe(null)
    })

    it('should return null if the password is incorrec', async () => {
      const { pw, mailer, userRepo } = setup()
      pw.verify = jest.fn(() => Promise.resolve(false))

      const authService = AuthService({ pw, mailer, userRepo })
      const user = await authService.authenticate('username', 'password')

      expect(pw.verify).toHaveBeenCalled()
      expect(user).toBe(null)
    })
  })

  describe('#forgotPassword()', () => {
    it('should send password reset email and return a user instance when the email address was found', async () => {
      const { pw, mailer, userRepo } = setup()
      mailer.sendPasswordResetEmail = jest.fn()

      const authService = AuthService({ pw, mailer, userRepo })
      const user = await authService.forgotPassword('test@example.com')

      expect(mailer.sendPasswordResetEmail).toHaveBeenCalled()
      expect(user).toBeInstanceOf(OAuthUser)
    })

    it('should return null when the email address was not found', async () => {
      const { pw, mailer, userRepo } = setup()
      userRepo.getUser = jest.fn(() => Promise.resolve(null))

      const authService = AuthService({ pw, mailer, userRepo })
      const user = await authService.forgotPassword('test@example.com')

      expect(user).toBe(null)
    })
  })

  describe('#validatePasswordResetToken()', () => {
    it('should return a user instance when the password reset token is valid', async () => {
      const { pw, mailer, userRepo } = setup()

      const authService = AuthService({ pw, mailer, userRepo })
      const user = await authService.validatePasswordResetToken('password-rest-token')

      expect(user).toBeInstanceOf(OAuthUser)
    })

    it('should return null when the password reset token is invalid', async () => {
      const { pw, mailer, userRepo } = setup()
      userRepo.getUserByPasswordResetToken = jest.fn((token) => null)

      const authService = AuthService({ pw, mailer, userRepo })
      const user = await authService.validatePasswordResetToken('password-rest-token')

      expect(user).toBe(null)
    })
  })

  describe('#resetPassword()', () => {
    it('should change password and return a user instance when the password reset token is valid', async () => {
      const { pw, mailer, userRepo } = setup()
      pw.hash = jest.fn(() => Promise.resolve('hashed-password'))

      const authService = AuthService({ pw, mailer, userRepo })
      const user = await authService.resetPassword('password-rest-token', 'new-password')

      expect(pw.hash).toHaveBeenCalled()
      expect(user).toBeInstanceOf(OAuthUser)
    })

    it('should return null when the password reset token is invalid', async () => {
      const { pw, mailer, userRepo } = setup()
      userRepo.getUserByPasswordResetToken = jest.fn(() => Promise.resolve(null))

      const authService = AuthService({ pw, mailer, userRepo })
      const user = await authService.resetPassword('password-rest-token', 'new-password')

      expect(user).toBe(null)
    })
  })
})

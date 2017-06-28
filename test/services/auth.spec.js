import OAuthUser from '../../src/models/oauth_user'
import MailerService from '../../src/services/mailer'
import AuthService from '../../src/services/auth'

// mongoose.Collection.prototype.insert = function (docs, options, callback) {
//   callback(null, docs)
// }

const mockPw = {
  hash: jest.fn(() => Promise.resolve('hashed password')),
  verify: jest.fn(() => Promise.resolve(true))
}

const mockMailer = {
  sendPasswordResetEmail: jest.fn()
}

const mockOAuthUser = {
  createUser: jest.fn((user) => new OAuthUser(user)),
  getUser: jest.fn((identifier) => new OAuthUser()),
  getUserByPasswordResetToken: jest.fn((token) => new OAuthUser()),
  save: jest.fn((user) => new OAuthUser(user))
}

describe('AuthService', () => {
  describe('#createUser()', () => {
    it('should create a new user', async () => {
      const authService = AuthService({ pw: mockPw, mailer: mockMailer, OAuthUser: mockOAuthUser })
      const data = {
        firstName: 'Test',
        lastName: 'User',
        username: 'test',
        email: 'test@example.com',
        password: '123qwe'
      }
      const user = await authService.createUser(data)
      expect(mockPw.hash).toHaveBeenCalled()
      expect(mockOAuthUser.createUser).toHaveBeenCalled()
      expect(user).toBeInstanceOf(OAuthUser)
      expect(user.id).toBeDefined()
      expect(user.username).toBe(data.username)
      expect(user.password).toBe('hashed password')
      expect(user.email).toBe(data.email)
      expect(user.profile).toBeDefined()
      expect(user.profile.firstName).toBe(data.firstName)
      expect(user.profile.lastName).toBe(data.lastName)
      expect(user.profile.name).toEqual(`${data.firstName} ${data.lastName}`)
    })
  })

  describe('#authenticate()', () => {
    it('should return a user instance when authenticated', async () => {
      const mockPw = { verify: jest.fn(() => Promise.resolve(true)) }
      const authService = AuthService({ pw: mockPw, mailer: mockMailer, OAuthUser: mockOAuthUser })
      const user = await authService.authenticate('username', 'password')
      expect(user).toBeInstanceOf(OAuthUser)
    })

    it('should return null when authenticated', async () => {
      const mockPw = { verify: jest.fn(() => Promise.resolve(false)) }
      const authService = AuthService({ pw: mockPw, mailer: mockMailer, OAuthUser: mockOAuthUser })
      const user = await authService.authenticate('username', 'password')
      expect(user).toBe(null)
    })
  })

  describe('#forgotPassword()', () => {
    it('should return a user instance when the email address was found', async () => {
      const authService = AuthService({ pw: mockPw, mailer: mockMailer, OAuthUser: mockOAuthUser })
      const user = await authService.forgotPassword('test@example.com')
      expect(user).toBeInstanceOf(OAuthUser)
    })

    it('should return null when the email address was not found', async () => {
      mockOAuthUser.getUser = jest.fn((identifier) => null)
      const authService = AuthService({ pw: mockPw, mailer: mockMailer, OAuthUser: mockOAuthUser })
      const user = await authService.forgotPassword('test@example.com')
      expect(user).toBe(null)
    })
  })

  describe('#validatePasswordResetToken()', () => {
    it('should return a user instance when the password reset token is valid', async () => {
      const authService = AuthService({ pw: mockPw, mailer: mockMailer, OAuthUser: mockOAuthUser })
      const user = await authService.validatePasswordResetToken('password-rest-token')
      expect(user).toBeInstanceOf(OAuthUser)
    })

    it('should return null when the password reset token is invalid', async () => {
      mockOAuthUser.getUserByPasswordResetToken = jest.fn((token) => null)
      const authService = AuthService({ pw: mockPw, mailer: mockMailer, OAuthUser: mockOAuthUser })
      const user = await authService.validatePasswordResetToken('password-rest-token')
      expect(user).toBe(null)
    })
  })

  describe('#resetPassword()', () => {
    it('should change password and return a user instance when the password reset token is valid', async () => {
      mockOAuthUser.getUserByPasswordResetToken = jest.fn((token) => new OAuthUser())
      const authService = AuthService({ pw: mockPw, mailer: mockMailer, OAuthUser: mockOAuthUser })
      const user = await authService.resetPassword('password-rest-token', 'new-password')
      expect(mockPw.hash).toHaveBeenCalled()
      expect(user).toBeInstanceOf(OAuthUser)
    })

    it('should return null when the password reset token is invalid', async () => {
      mockOAuthUser.getUserByPasswordResetToken = jest.fn((token) => null)
      const authService = AuthService({ pw: mockPw, mailer: mockMailer, OAuthUser: mockOAuthUser })
      const user = await authService.resetPassword('password-rest-token', 'new-password')
      expect(user).toBe(null)
    })
  })
})

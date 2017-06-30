import httpMocks from 'node-mocks-http'
import AuthService from '../../src/services/auth'
import PasswordController from '../../src/controllers/auth/password'

jest.mock('credential', () => () => ({
  hash: () => Promise.resolve('hashed-password'),
  verify: () => Promise.resolve(true)
}))
jest.mock('../../src/repositories/oauth_user', () => require('../mocks/repositories/oauth_user'))
jest.mock('../../src/services/mailer', () => () => ({
  send: jest.fn(),
  sendPasswordResetEmail: jest.fn()
}))

function setup () {
  const authService = AuthService()

  return { authService }
}

describe('PasswordController', () => {
  describe('#PasswordController()', () => {
    it('should create a PasswordController', () => {
      const passwordController = PasswordController()
      expect(passwordController).toBeInstanceOf(Object)
    })
  })

  describe('#getForgot()', () => {
    it('should render forgot password page', async () => {
      const { authService } = setup()

      const req = httpMocks.createRequest({ method: 'GET', url: '/password/forgot' })
      const res = httpMocks.createResponse()

      jest.spyOn(res, 'render')

      const passwordController = PasswordController({ authService })
      await passwordController.getForgot(req, res)

      expect(res.render).toHaveBeenCalledWith(req.url)
    })
  })

  describe('#postForgot()', () => {
    it('should handle the forgot password request', async () => {
      const { authService } = setup()

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/password/forgot',
        body: { email: 'test@example.com' },
        flash: jest.fn(),
        assert: jest.fn(() => ({ isEmail: jest.fn() })),
        sanitize: jest.fn(() => ({ normalizeEmail: jest.fn() })),
        validationErrors: jest.fn(() => false)
      })
      const res = httpMocks.createResponse()

      const passwordController = PasswordController({ authService })
      await passwordController.postForgot(req, res)

      expect(req.flash.mock.calls[0][0]).toBe('success')
      expect(res._getRedirectUrl()).toBe('/password/forgot')
    })

    it('should redirect to back if validation error occurs', async () => {
      const { authService } = setup()

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/password/forgot',
        body: { email: 'test@example.com' },
        flash: jest.fn(),
        assert: jest.fn(() => ({ isEmail: jest.fn() })),
        sanitize: jest.fn(() => ({ normalizeEmail: jest.fn() })),
        validationErrors: jest.fn(() => true)
      })
      const res = httpMocks.createResponse()

      const passwordController = PasswordController({ authService })
      await passwordController.postForgot(req, res)

      expect(req.flash.mock.calls[0][0]).toBe('errors')
      expect(res._getRedirectUrl()).toBe('/password/forgot')
    })

    it('should redirect to back if password reset token is invalid', async () => {
      const { authService } = setup()
      authService.forgotPassword = jest.fn(() => Promise.resolve(null))

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/password/forgot',
        body: { email: 'test@example.com' },
        flash: jest.fn(),
        assert: jest.fn(() => ({ isEmail: jest.fn() })),
        sanitize: jest.fn(() => ({ normalizeEmail: jest.fn() })),
        validationErrors: jest.fn(() => false)
      })
      const res = httpMocks.createResponse()

      const passwordController = PasswordController({ authService })
      await passwordController.postForgot(req, res)

      expect(req.flash.mock.calls[0][0]).toBe('errors')
      expect(res._getRedirectUrl()).toBe('/password/forgot')
    })
  })

  describe('#getReset()', () => {
    it('should render reset password page', async () => {
      const { authService } = setup()
      authService.validatePasswordResetToken = jest.fn(() => Promise.resolve({ username: 'test' }))

      const req = httpMocks.createRequest({ method: 'GET', url: '/password/reset' })
      const res = httpMocks.createResponse()

      jest.spyOn(res, 'render')

      const passwordController = PasswordController({ authService })
      await passwordController.getReset(req, res)

      expect(res.render).toHaveBeenCalledWith(req.url, { username: 'test' })
    })

    it('should redirect to back if password reset token is invalid', async () => {
      const { authService } = setup()
      authService.validatePasswordResetToken = jest.fn(() => Promise.resolve(null))

      const req = httpMocks.createRequest({ method: 'GET', url: '/password/reset', flash: jest.fn() })
      const res = httpMocks.createResponse()

      const passwordController = PasswordController({ authService })
      await passwordController.getReset(req, res)

      expect(res._getRedirectUrl()).toBe('/password/forgot')
    })
  })

  describe('#postReset()', () => {
    it('should handle the reset password request', async () => {
      const { authService } = setup()

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/password/reset',
        body: { password: 'test@example.com', confirmPassword: 'test@example.com' },
        login: jest.fn((user, callback) => callback()),
        flash: jest.fn(),
        assert: jest.fn(() => ({ len: jest.fn(), equals: jest.fn() })),
        validationErrors: jest.fn(() => false)
      })
      const res = httpMocks.createResponse()

      const passwordController = PasswordController({ authService })
      await passwordController.postReset(req, res)

      expect(req.login).toHaveBeenCalled()
      expect(res._getRedirectUrl()).toBe('/')
    })

    it('should redirect to back if validation error occurs', async () => {
      const { authService } = setup()

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/password/reset',
        body: { password: 'test@example.com', confirmPassword: 'test@example.com' },
        login: jest.fn((user, callback) => callback()),
        flash: jest.fn(),
        assert: jest.fn(() => ({ len: jest.fn(), equals: jest.fn() })),
        validationErrors: jest.fn(() => true)
      })
      const res = httpMocks.createResponse()

      const passwordController = PasswordController({ authService })
      await passwordController.postReset(req, res)

      expect(res._getRedirectUrl()).toBe('back')
    })

    it('should redirect to back if password reset token is invalid', async () => {
      const { authService } = setup()
      authService.resetPassword = jest.fn(() => Promise.resolve(false))

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/password/reset',
        body: { password: 'test@example.com', confirmPassword: 'test@example.com' },
        login: jest.fn((user, callback) => callback()),
        flash: jest.fn(),
        assert: jest.fn(() => ({ len: jest.fn(), equals: jest.fn() })),
        validationErrors: jest.fn(() => false)
      })
      const res = httpMocks.createResponse()

      const passwordController = PasswordController({ authService })
      await passwordController.postReset(req, res)

      expect(res._getRedirectUrl()).toBe('/password/forgot')
    })
  })
})

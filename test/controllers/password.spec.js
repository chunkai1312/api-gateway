import httpMocks from 'node-mocks-http'
import PasswordController from '../../src/controllers/auth/password'

describe('PasswordController', () => {
  describe('#getForgot()', () => {
    it('should render forgot password page', async () => {
      const req = httpMocks.createRequest({ method: 'GET', url: '/password/forgot' })
      const res = httpMocks.createResponse()

      jest.spyOn(res, 'render')

      const passwordController = PasswordController()
      await passwordController.getForgot(req, res)

      expect(res.render).toHaveBeenCalledWith(req.url)
    })
  })

  describe('#postForgot()', () => {
    it('should handle the forgot password request', async () => {
      const mockAuthService = {
        forgotPassword: jest.fn(() => true)
      }

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

      const passwordController = PasswordController({ authService: mockAuthService })
      await passwordController.postForgot(req, res)

      expect(req.flash.mock.calls[0][0]).toBe('success')
      expect(res._getRedirectUrl()).toBe('/password/forgot')
    })

    it('should redirect to back when validation error occurs', async () => {
      const mockAuthService = {
        forgotPassword: jest.fn(() => true)
      }

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

      const passwordController = PasswordController({ authService: mockAuthService })
      await passwordController.postForgot(req, res)

      expect(req.flash.mock.calls[0][0]).toBe('errors')
      expect(res._getRedirectUrl()).toBe('/password/forgot')
    })
  })

  describe('#getReset()', () => {
    it('should render reset password page', async () => {
      const user = { username: 'test' }
      const mockAuthService = {
        validatePasswordResetToken: jest.fn(() => user)
      }

      const req = httpMocks.createRequest({ method: 'GET', url: '/password/reset' })
      const res = httpMocks.createResponse()

      jest.spyOn(res, 'render')

      const passwordController = PasswordController({ authService: mockAuthService })
      await passwordController.getReset(req, res)

      expect(res.render).toHaveBeenCalledWith(req.url, user)
    })

    it('should redirect to back when password reset token is invalid', async () => {
      // const user = { username: 'test' }
      const mockAuthService = {
        validatePasswordResetToken: jest.fn(() => false)
      }

      const req = httpMocks.createRequest({ method: 'GET', url: '/password/reset', flash: jest.fn() })
      const res = httpMocks.createResponse()

      jest.spyOn(res, 'render')

      const passwordController = PasswordController({ authService: mockAuthService })
      await passwordController.getReset(req, res)

      expect(res._getRedirectUrl()).toBe('/password/forgot')
    })
  })

  describe('#postReset()', () => {
    it('should handle the reset password request', async () => {
      const user = { username: 'test' }
      const mockAuthService = {
        resetPassword: jest.fn(() => user)
      }

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/password/reset',
        body: { password: 'test@example.com', confirmPassword: 'test@example.com' },
        login: jest.fn(),
        flash: jest.fn(),
        assert: jest.fn(() => ({ len: jest.fn(), equals: jest.fn() })),
        validationErrors: jest.fn(() => false)
      })
      const res = httpMocks.createResponse()

      const passwordController = PasswordController({ authService: mockAuthService })
      await passwordController.postReset(req, res)

      expect(req.login).toHaveBeenCalled()
    })

    it('should redirect to back when validation error occurs', async () => {
      const user = { username: 'test' }
      const mockAuthService = {
        resetPassword: jest.fn(() => user)
      }

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/password/reset',
        body: { password: 'test@example.com', confirmPassword: 'test@example.com' },
        login: jest.fn(),
        flash: jest.fn(),
        assert: jest.fn(() => ({ len: jest.fn(), equals: jest.fn() })),
        validationErrors: jest.fn(() => true)
      })
      const res = httpMocks.createResponse()

      const passwordController = PasswordController({ authService: mockAuthService })
      await passwordController.postReset(req, res)

      expect(res._getRedirectUrl()).toBe('back')
    })

    it('should redirect to back when password reset token is invalid', async () => {
      // const user = { username: 'test' }
      const mockAuthService = {
        resetPassword: jest.fn(() => false)
      }

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/password/reset',
        body: { password: 'test@example.com', confirmPassword: 'test@example.com' },
        login: jest.fn(),
        flash: jest.fn(),
        assert: jest.fn(() => ({ len: jest.fn(), equals: jest.fn() })),
        validationErrors: jest.fn(() => true)
      })
      const res = httpMocks.createResponse()

      const passwordController = PasswordController({ authService: mockAuthService })
      await passwordController.postReset(req, res)

      expect(res._getRedirectUrl()).toBe('back')
    })
  })
})

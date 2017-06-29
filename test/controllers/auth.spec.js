import httpMocks from 'node-mocks-http'
import AuthController from '../../src/controllers/auth/auth'

describe('AuthController', () => {
  describe('#getLogin()', () => {
    it('should render login page', async () => {
      const req = httpMocks.createRequest({ method: 'GET', url: '/login' })
      const res = httpMocks.createResponse()

      jest.spyOn(res, 'render')

      const authController = AuthController()
      await authController.getLogin(req, res)

      expect(res.render).toHaveBeenCalledWith(req.url)
    })
  })

  describe('#postLogin()', () => {
    it('should handle user login', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/login',
        login: jest.fn(),
        flash: jest.fn(),
        assert: jest.fn(() => ({ notEmpty: jest.fn() })),
        validationErrors: jest.fn(() => false)
      })
      const res = httpMocks.createResponse()

      const mockAuthService = {
        authenticate: jest.fn(() => true),
        createUser: jest.fn()
      }

      const authController = AuthController({ authService: mockAuthService })
      await authController.postLogin(req, res)

      expect(req.login).toHaveBeenCalled()
    })

    it('should redirect to back when validation error occurs', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/login',
        login: jest.fn(),
        flash: jest.fn(),
        assert: jest.fn(() => ({ notEmpty: jest.fn() })),
        validationErrors: jest.fn(() => true)
      })
      const res = httpMocks.createResponse()

      const mockAuthService = {
        authenticate: jest.fn(() => true),
        createUser: jest.fn()
      }

      const authController = AuthController({ authService: mockAuthService })
      await authController.postLogin(req, res)

      expect(res._getRedirectUrl()).toBe('/login')
    })

    it('should redirect to back when authentication error occurs', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/login',
        login: jest.fn(),
        flash: jest.fn(),
        assert: jest.fn(() => ({ notEmpty: jest.fn() })),
        validationErrors: jest.fn(() => false)
      })
      const res = httpMocks.createResponse()

      const mockAuthService = {
        authenticate: jest.fn(() => false),
        createUser: jest.fn()
      }

      const authController = AuthController({ authService: mockAuthService })
      await authController.postLogin(req, res)

      expect(res._getRedirectUrl()).toBe('/login')
    })
  })

  describe('#logout()', () => {
    it('should handle user logout', async () => {
      const req = httpMocks.createRequest({ method: 'GET', url: '/logout', logout: jest.fn() })
      const res = httpMocks.createResponse()

      const authController = AuthController()
      await authController.logout(req, res)

      expect(req.logout).toHaveBeenCalled()
      expect(res._getRedirectUrl()).toBe('/')
    })
  })

  describe('#getSignup()', () => {
    it('should render signup page', async () => {
      const req = httpMocks.createRequest({ method: 'GET', url: '/signup' })
      const res = httpMocks.createResponse()

      jest.spyOn(res, 'render')

      const authController = AuthController()
      await authController.getSignup(req, res)

      expect(res.render).toHaveBeenCalledWith(req.url)
    })
  })

  describe('#postSignup()', () => {
    it('should handle user signup', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/signup',
        login: jest.fn(),
        flash: jest.fn(),
        assert: jest.fn(() => ({ notEmpty: jest.fn(), isEmail: jest.fn(), len: jest.fn(), equals: jest.fn() })),
        sanitize: jest.fn(() => ({ normalizeEmail: jest.fn() })),
        validationErrors: jest.fn(() => false)
      })
      const res = httpMocks.createResponse()

      const mockAuthService = {
        authenticate: jest.fn(() => true),
        createUser: jest.fn(() => true)
      }

      const authController = AuthController({ authService: mockAuthService })
      await authController.postSignup(req, res)

      expect(req.login).toHaveBeenCalled()
    })

    it('should redirect to back when validation error occurs', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/signup',
        login: jest.fn(),
        flash: jest.fn(),
        assert: jest.fn(() => ({ notEmpty: jest.fn(), isEmail: jest.fn(), len: jest.fn(), equals: jest.fn() })),
        sanitize: jest.fn(() => ({ normalizeEmail: jest.fn() })),
        validationErrors: jest.fn(() => true)
      })
      const res = httpMocks.createResponse()

      const mockAuthService = {
        authenticate: jest.fn(() => true),
        createUser: jest.fn(() => true)
      }

      const authController = AuthController({ authService: mockAuthService })
      await authController.postSignup(req, res)

      expect(res._getRedirectUrl()).toBe('/signup')
    })

    it('should redirect to back when creating user error occurs', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/signup',
        login: jest.fn(),
        flash: jest.fn(),
        assert: jest.fn(() => ({ notEmpty: jest.fn(), isEmail: jest.fn(), len: jest.fn(), equals: jest.fn() })),
        sanitize: jest.fn(() => ({ normalizeEmail: jest.fn() })),
        validationErrors: jest.fn(() => false)
      })
      const res = httpMocks.createResponse()

      const mockAuthService = {
        authenticate: jest.fn(() => true),
        createUser: jest.fn(() => false)
      }

      const authController = AuthController({ authService: mockAuthService })
      await authController.postSignup(req, res)

      expect(res._getRedirectUrl()).toBe('/signup')
    })
  })
})

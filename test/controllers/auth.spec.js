import httpMocks from 'node-mocks-http'
import AuthService from '../../src/services/auth'
import AuthController from '../../src/controllers/auth/auth'

jest.mock('credential', () => () => ({
  hash: () => Promise.resolve('hashed-password'),
  verify: () => Promise.resolve(true)
}))
jest.mock('../../src/repositories/oauth_user', () => require('../mocks/repositories/oauth_user'))

function setup () {
  const authService = AuthService()

  return { authService }
}

describe('AuthController', () => {
  describe('#AuthController()', () => {
    it('should create an AuthController', () => {
      const authController = AuthController()
      expect(authController).toBeInstanceOf(Object)
    })
  })

  describe('#getLogin()', () => {
    it('should render login page', async () => {
      const { authService } = setup()

      const req = httpMocks.createRequest({ method: 'GET', url: '/login' })
      const res = httpMocks.createResponse()
      jest.spyOn(res, 'render')

      const authController = AuthController({ authService })
      await authController.getLogin(req, res)

      expect(res.render).toHaveBeenCalledWith(req.url)
    })
  })

  describe('#postLogin()', () => {
    it('should handle user login', async () => {
      const { authService } = setup()

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/login',
        body: { identifier: 'username', password: 'password' },
        login: jest.fn((user, callback) => callback()),
        flash: jest.fn(),
        assert: jest.fn(() => ({ notEmpty: jest.fn() })),
        validationErrors: jest.fn(() => false)
      })
      const res = httpMocks.createResponse()

      const authController = AuthController({ authService })
      await authController.postLogin(req, res)

      expect(req.login).toHaveBeenCalled()
      expect(res._getRedirectUrl()).toBe('/')
    })

    it('should redirect to specific url if the session "returnTo" is set', async () => {
      const { authService } = setup()

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/login',
        body: { identifier: 'username', password: 'password' },
        session: { returnTo: 'https://www.example.com' },
        login: jest.fn((user, callback) => callback()),
        flash: jest.fn(),
        assert: jest.fn(() => ({ notEmpty: jest.fn() })),
        validationErrors: jest.fn(() => false)
      })
      const res = httpMocks.createResponse()

      const authController = AuthController({ authService })
      await authController.postLogin(req, res)

      expect(req.login).toHaveBeenCalled()
      expect(res._getRedirectUrl()).toBe('https://www.example.com')
    })

    it('should normalize email address if identifier using email', async () => {
      const { authService } = setup()

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/login',
        body: { identifier: 'test@example.com', password: 'password' },
        login: jest.fn((user, callback) => callback()),
        flash: jest.fn(),
        assert: jest.fn(() => ({ notEmpty: jest.fn() })),
        sanitize: jest.fn(() => ({ normalizeEmail: jest.fn() })),
        validationErrors: jest.fn(() => false)
      })
      const res = httpMocks.createResponse()
      jest.spyOn(res, 'redirect')

      const authController = AuthController({ authService })
      await authController.postLogin(req, res)

      expect(req.login).toHaveBeenCalled()
      expect(res._getRedirectUrl()).toBe('/')
    })

    it('should redirect to back if form validation error occurs', async () => {
      const { authService } = setup()

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/login',
        body: { identifier: 'username', password: 'password' },
        login: jest.fn((user, callback) => callback()),
        flash: jest.fn(),
        assert: jest.fn(() => ({ notEmpty: jest.fn() })),
        validationErrors: jest.fn(() => true)
      })
      const res = httpMocks.createResponse()

      const authController = AuthController({ authService })
      await authController.postLogin(req, res)

      expect(res._getRedirectUrl()).toBe('/login')
    })

    it('should redirect to back if authentication error occurs', async () => {
      const { authService } = setup()
      authService.authenticate = jest.fn(() => Promise.resolve(false))

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/login',
        body: { identifier: 'username', password: 'password' },
        login: jest.fn((user, callback) => callback()),
        flash: jest.fn(),
        assert: jest.fn(() => ({ notEmpty: jest.fn() })),
        validationErrors: jest.fn(() => false)
      })
      const res = httpMocks.createResponse()

      const authController = AuthController({ authService })
      await authController.postLogin(req, res)

      expect(res._getRedirectUrl()).toBe('/login')
    })
  })

  describe('#logout()', () => {
    it('should handle user logout', async () => {
      const { authService } = setup()

      const req = httpMocks.createRequest({ method: 'GET', url: '/logout', logout: jest.fn() })
      const res = httpMocks.createResponse()

      const authController = AuthController({ authService })
      await authController.logout(req, res)

      expect(req.logout).toHaveBeenCalled()
      expect(res._getRedirectUrl()).toBe('/')
    })
  })

  describe('#getSignup()', () => {
    it('should render signup page', async () => {
      const { authService } = setup()

      const req = httpMocks.createRequest({ method: 'GET', url: '/signup' })
      const res = httpMocks.createResponse()

      jest.spyOn(res, 'render')

      const authController = AuthController({ authService })
      await authController.getSignup(req, res)

      expect(res.render).toHaveBeenCalledWith(req.url)
    })
  })

  describe('#postSignup()', () => {
    it('should handle user signup', async () => {
      const { authService } = setup()

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/signup',
        body: {
          firstName: 'Test',
          lastName: 'User',
          username: 'username',
          email: 'test@example.com',
          password: 'password',
          confirmPassword: 'password'
        },
        login: jest.fn((user, callback) => callback()),
        flash: jest.fn(),
        assert: jest.fn(() => ({ notEmpty: jest.fn(), isEmail: jest.fn(), len: jest.fn(), equals: jest.fn() })),
        sanitize: jest.fn(() => ({ normalizeEmail: jest.fn() })),
        validationErrors: jest.fn(() => false)
      })
      const res = httpMocks.createResponse()

      const authController = AuthController({ authService })
      await authController.postSignup(req, res)

      expect(req.login).toHaveBeenCalled()
      expect(res._getRedirectUrl()).toBe('/')
    })

    it('should redirect to back if validation error occurs', async () => {
      const { authService } = setup()

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/signup',
        body: {
          firstName: 'Test',
          lastName: 'User',
          username: 'username',
          email: 'test@example.com',
          password: 'password',
          confirmPassword: 'password'
        },
        login: jest.fn((user, callback) => callback()),
        flash: jest.fn(),
        assert: jest.fn(() => ({ notEmpty: jest.fn(), isEmail: jest.fn(), len: jest.fn(), equals: jest.fn() })),
        sanitize: jest.fn(() => ({ normalizeEmail: jest.fn() })),
        validationErrors: jest.fn(() => true)
      })
      const res = httpMocks.createResponse()

      const authController = AuthController({ authService })
      await authController.postSignup(req, res)

      expect(res._getRedirectUrl()).toBe('/signup')
    })

    it('should redirect to back if creating user error occurs', async () => {
      const { authService } = setup()
      authService.createUser = jest.fn(() => Promise.resolve(false))

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/signup',
        login: jest.fn((user, callback) => callback()),
        flash: jest.fn(),
        assert: jest.fn(() => ({ notEmpty: jest.fn(), isEmail: jest.fn(), len: jest.fn(), equals: jest.fn() })),
        sanitize: jest.fn(() => ({ normalizeEmail: jest.fn() })),
        validationErrors: jest.fn(() => false)
      })
      const res = httpMocks.createResponse()

      const authController = AuthController({ authService })
      await authController.postSignup(req, res)

      expect(res._getRedirectUrl()).toBe('/signup')
    })
  })
})

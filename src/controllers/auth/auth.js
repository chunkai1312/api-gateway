import { validator } from 'express-validator'
import AuthService from '../../services/auth'

function AuthController (dependencies = { authService: AuthService() }) {
  const { authService } = dependencies

  const authController = {}

  /**
   * GET /login
   * Login page.
   */
  authController.getLogin = async (req, res) => {
    res.render(req.route.path)
  }

  /**
   * POST /login
   * Sign in using username/email and password.
   */
  authController.postLogin = async (req, res) => {
    req.assert('login', 'Username/Email cannot be blank').notEmpty()
    req.assert('password', 'Password cannot be blank').notEmpty()
    if (validator.isEmail(req.body.login)) {
      req.sanitize('login').normalizeEmail({ gmail_remove_dots: false })
    }

    const errors = req.validationErrors()
    if (errors) {
      req.flash('errors', errors)
      return res.redirect('/login')
    }

    const { login, password } = req.body
    const user = await authService.authenticate(login, password)
    if (!user) {
      req.flash('errors', { msg: 'Invalid username/email or password' })
      return res.redirect('/login')
    }

    const url = req.session && req.session.returnTo
    if (url) delete req.session.returnTo
    req.login(user, () => res.redirect(url || '/'))
  }

  /**
   * GET /logout
   * Log out.
   */
  authController.logout = async (req, res) => {
    req.logout()
    res.redirect('/')
  }

  /**
   * GET /signup
   * Signup page.
   */
  authController.getSignup = async (req, res) => {
    res.render(req.route.path)
  }

  /**
   * POST /signup
   * Create a new local account.
   */
  authController.postSignup = async (req, res) => {
    req.assert('firstName', 'First Name is required').notEmpty()
    req.assert('lastName', 'Last Name is required').notEmpty()
    req.assert('username', 'Username is required').notEmpty()
    req.assert('email', 'Email is not valid').isEmail()
    req.assert('password', 'Password must be at least 4 characters long').len(4)
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password)
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false })

    const errors = req.validationErrors()
    if (errors) {
      req.flash('errors', errors)
      return res.redirect('/signup')
    }

    const user = await authService.createUser(req.body)
    if (!user) {
      req.flash('errors', { msg: 'Account with that username or email address already exists.' })
      return res.redirect('/signup')
    }

    req.login(user, () => res.redirect('/'))
  }

  return authController
}

export default AuthController

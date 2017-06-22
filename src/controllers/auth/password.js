import AuthService from '../../services/auth'

function PasswordController (dependencies = { authService: AuthService() }) {
  const { authService } = dependencies

  const passwordController = {}

  /**
   * GET /password/forgot
   * Forgot Password page.
   */
  passwordController.getForgot = async (req, res) => {
    res.render(req.route.path)
  }

  /**
   * POST /password/forgot
   * Create a random token, then the send user an email with a reset link.
   */
  passwordController.postForgot = async (req, res) => {
    req.assert('email', 'Please enter a valid email address.').isEmail()
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false })

    const errors = req.validationErrors()
    if (errors) {
      req.flash('errors', errors)
      return res.redirect('/password/forgot')
    }

    const user = await authService.forgotPassword(req.body.email)
    if (user) req.flash('success', { msg: `An e-mail has been sent to ${user.email} with further instructions.` })
    else req.flash('errors', { msg: 'Account with that email address does not exist.' })

    res.redirect('/password/forgot')
  }

  /**
   * GET /password/reset/:token
   * Reset Password page.
   */
  passwordController.getReset = async (req, res) => {
    const user = await authService.validatePasswordResetToken(req.params.token)

    if (!user) {
      req.flash('errors', { msg: 'Password reset token is invalid or has expired.' })
      return res.redirect('/password/forgot')
    }

    res.render(req.route.path, { username: user.username })
  }

  /**
   * POST /password/reset/:token
   * Process the reset password request.
   */
  passwordController.postReset = async (req, res) => {
    req.assert('password', 'Password must be at least 4 characters long.').len(4)
    req.assert('confirm', 'Passwords must match.').equals(req.body.password)

    const errors = req.validationErrors()
    if (errors) {
      req.flash('errors', errors)
      return res.redirect('back')
    }

    const user = await authService.resetPassword(req.params.token, req.body.password)
    if (!user) {
      req.flash('errors', { msg: 'Password reset token is invalid or has expired.' })
      return res.redirect('/password/forgot')
    }

    req.login(user, () => res.redirect('/'))
  }

  return passwordController
}

export default PasswordController

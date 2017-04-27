import passport from 'passport'
import Joi from 'joi'
import error from 'http-errors'
import OAuthUser from '../models/oauth_user'
import { createToken } from '../models/oauth_token'
import { mailer } from '../services'

export default {

  index: async (req, res) => {
    res.json(req.user)
    // res.render('index', { title: 'Express', foo: { bar: 'baz' } })
  },

  showSignup: async (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/')

    res.render('signup', {
      errors: req.flash('errors'),
      message: req.flash('message'),
      success: req.flash('success')
    })
  },

  doSignup: async (req, res) => {
    const schema = Joi.object().keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      username: Joi.string().lowercase().required(),
      email: Joi.string().email().required(),
      password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
      confirm: Joi.string().required().valid(Joi.ref('password'))
    })

    const validation = Joi.validate(req.body, schema)
    if (validation.error) {
      req.flash('errors', validation.error.details)
      return res.redirect('/signup')
    }

    const userByUsername = await OAuthUser.findByUsername(req.body.username)
    if (userByUsername) {
      req.flash('message', 'Username already exists')
      return res.redirect('/signup')
    }

    const userByEmail = await OAuthUser.findByEmail(req.body.email)
    if (userByEmail) {
      req.flash('message', 'Email already in use')
      return res.redirect('/signup')
    }

    await OAuthUser.create(req.body)
    req.flash('success', true)
    res.redirect('/')
  },

  showLogin: async (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/')

    res.render('login', {
      error: req.flash('error')
    })
  },

  doLogin (req, res, next) {
    passport.authenticate('local', {
      successReturnToOrRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
    })(req, res, next)
  },

  doLogout: async (req, res) => {
    req.logout()
    res.redirect('/')
  },

  showForgot: async (req, res) => {
    if (req.isAuthenticated()) res.redirect('/')

    res.render('forgot', {
      errors: req.flash('errors'),
      message: req.flash('message'),
      success: req.flash('success')
    })
  },

  doForgot: async (req, res) => {
    const schema = Joi.object().keys({
      email: Joi.string().email().required()
    })

    const validation = Joi.validate(req.body, schema)
    if (validation.error) {
      req.flash('errors', validation.error.details)
      return res.redirect('/forgot')
    }

    const user = await OAuthUser.findByEmail(req.body.email)
    if (!user) {
      req.flash('message', 'Can\'t find that email, sorry.')
      return res.redirect('/forgot')
    }

    const token = createToken({ subject: user.id, expiresIn: 3600 })
    await user.savePasswordResetToken(token)

    const result = await mailer.sendPasswordReset(user.email, user.name, token)
    if (result.message !== 'success') throw error(500)

    req.flash('message', 'Check your email for a link to reset your password. If it doesn\'t appear within a few minutes, check your spam folder.')
    req.flash('success', true)
    res.redirect('/forgot')
  },

  showReset: async (req, res) => {
    if (req.isAuthenticated()) res.redirect('/')

    const user = await OAuthUser.findByPasswordResetToken(req.params.token)
    if (!user) return res.redirect('/reset')

    res.render('reset', {
      errors: req.flash('errors'),
      message: req.flash('message'),
      success: req.flash('success')
    })
  },

  doReset: async (req, res) => {
    const schema = Joi.object().keys({
      password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
      confirm: Joi.any().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } })
    })

    const validation = Joi.validate(req.body, schema)
    if (validation.error) {
      req.flash('errors', validation.error.details)
      return res.redirect(`/reset/${req.params.token}`)
    }

    const user = await OAuthUser.findByPasswordResetToken(req.params.token)
    if (!user) return res.redirect(`/reset/${req.params.token}`)

    await user.resetPassword(req.body.password)
    // req.flash('message', 'Your password has been successfully reset.')
    // req.flash('success', true)
    res.redirect('/login')
  },

  notFound: async (req, res) => {
    res.render('404')
  }

}

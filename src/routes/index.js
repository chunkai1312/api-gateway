import { Router } from 'express'
import oauth2 from '../config/oauth2orize'
import { auth } from '../middlewares'
import { user, client, token, main } from '../controllers'

const router = Router()

  .get('/oauth2/authorize', oauth2.authorization)
  .post('/oauth2/authorize', oauth2.decision)
  .post('/oauth2/token', oauth2.token)

  .get('/token/info', token.info)
  .get('/token/revoke', token.revoke)

  .get('/users', auth.isTrustedClient(), user.index)
  .post('/users', auth.isTrustedClient(), user.create)
  .get('/users/:id', auth.isTrustedClient(), user.show)
  .put('/users/:id', auth.isTrustedClient(), user.update)
  .delete('/users/:id', auth.isTrustedClient(), user.destroy)

  .get('/clients', auth.isTrustedClient(), client.index)
  .post('/clients', auth.isTrustedClient(), client.create)
  .get('/clients/:id', auth.isTrustedClient(), client.show)
  .put('/clients/:id', auth.isTrustedClient(), client.update)
  .delete('/clients/:id', auth.isTrustedClient(), client.destroy)

  .get('/', main.index)
  .get('/signup', main.showSignup)
  .post('/signup', main.doSignup)
  .get('/login', main.showLogin)
  .post('/login', main.doLogin)
  .get('/logout', main.doLogout)
  .get('/forgot', main.showForgot)
  .post('/forgot', main.doForgot)
  .get('/reset/:token', main.showReset)
  .post('/reset/:token', main.doReset)
  .get('/*', main.notFound)

export default () => router

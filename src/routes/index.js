import { Router } from 'express'
import oauth2 from '../config/oauth2orize'
import { auth } from '../middlewares'
import { account, user, client, token } from '../controllers'

const router = Router()

  .get('/oauth2/authorize', oauth2.authorization)
  .post('/oauth2/authorize', oauth2.decision)
  .post('/oauth2/token', oauth2.token)
  .get('/oauth2/token/info', token.info)
  .get('/oauth2/token/revoke', token.revoke)

  .get('/oauth2/users', auth.isTrustedClient(), user.index)
  .post('/oauth2/users', auth.isTrustedClient(), user.create)
  .get('/oauth2/users/:id', auth.isTrustedClient(), user.show)
  .put('/oauth2/users/:id', auth.isTrustedClient(), user.update)
  .delete('/oauth2/users/:id', auth.isTrustedClient(), user.destroy)

  .get('/oauth2/clients', auth.isTrustedClient(), client.index)
  .post('/oauth2/clients', auth.isTrustedClient(), client.create)
  .get('/oauth2/clients/:id', auth.isTrustedClient(), client.show)
  .put('/oauth2/clients/:id', auth.isTrustedClient(), client.update)
  .delete('/oauth2/clients/:id', auth.isTrustedClient(), client.destroy)

  .get('/', account.index)
  .get('/signup', account.showSignup)
  .post('/signup', account.doSignup)
  .get('/login', account.showLogin)
  .post('/login', account.doLogin)
  .get('/logout', account.doLogout)
  .get('/password/forgot', account.showForgot)
  .post('/password/forgot', account.doForgot)
  .get('/password/reset/:token', account.showReset)
  .post('/password/reset/:token', account.doReset)
  .get('/*', (req, res) => res.render(req.url))

export default () => router

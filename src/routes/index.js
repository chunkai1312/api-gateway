import { Router } from 'express'
import oauth2 from '../config/oauth2orize'
import { auth } from '../middlewares'
import { oauthUser, oauthClient, main } from '../controllers'

const router = Router()

  .get('/oauth2/authorize', oauth2.authorization)
  .post('/oauth2/authorize', oauth2.decision)
  .post('/oauth2/token', oauth2.token)

  .get('/users', auth.isTrustedClient(), oauthUser.index)
  .post('/users', auth.isTrustedClient(), oauthUser.create)
  .get('/users/:id', auth.isTrustedClient(), oauthUser.show)
  .put('/users/:id', auth.isTrustedClient(), oauthUser.update)
  .delete('/users/:id', auth.isTrustedClient(), oauthUser.destroy)

  .get('/clients', auth.isTrustedClient(), oauthClient.index)
  .post('/clients', auth.isTrustedClient(), oauthClient.create)
  .get('/clients/:id', auth.isTrustedClient(), oauthClient.show)
  .put('/clients/:id', auth.isTrustedClient(), oauthClient.update)
  .delete('/clients/:id', auth.isTrustedClient(), oauthClient.destroy)

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

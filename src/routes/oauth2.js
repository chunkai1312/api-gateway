import { Router } from 'express'
import oauth2 from '../config/oauth2orize'
import { auth } from '../middlewares'
import { oauthUser, oauthClient } from '../controllers'

const router = Router()

  .get('/authorize', oauth2.authorization)
  .post('/authorize', oauth2.decision)
  .post('/token', oauth2.token)

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

export default () => router

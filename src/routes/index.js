import { Router } from 'express'
import oauth2 from '../config/oauth2orize'
import { authorize } from '../middlewares'
import { account, user, client, token } from '../controllers'

const wrap = fn => (...args) => fn(...args).catch(args[2])

const router = Router()

  .get('/oauth2/authorize', oauth2.authorization)
  .post('/oauth2/authorize', oauth2.decision)
  .post('/oauth2/token', oauth2.token)
  .get('/oauth2/token/info', token.info)
  .get('/oauth2/token/revoke', token.revoke)

  .get('/oauth2/users', authorize({ scope: 'oauth_user' }), wrap(user.index))
  .post('/oauth2/users', authorize({ scope: 'oauth_user' }), wrap(user.create))
  .get('/oauth2/users/:id', authorize({ scope: 'oauth_user' }), wrap(user.show))
  .put('/oauth2/users/:id', authorize({ scope: 'oauth_user' }), wrap(user.update))
  .delete('/oauth2/users/:id', authorize({ scope: 'oauth_user' }), wrap(user.destroy))

  .get('/oauth2/clients', authorize({ scope: 'oauth_client' }), wrap(client.index))
  .post('/oauth2/clients', authorize({ scope: 'oauth_client' }), wrap(client.create))
  .get('/oauth2/clients/:id', authorize({ scope: 'oauth_client' }), wrap(client.show))
  .put('/oauth2/clients/:id', authorize({ scope: 'oauth_client' }), wrap(client.update))
  .delete('/oauth2/clients/:id', authorize({ scope: 'oauth_client' }), wrap(client.destroy))

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

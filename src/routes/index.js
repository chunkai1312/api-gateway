import { Router } from 'express'
import { ensureLoggedIn, ensureLoggedOut } from 'connect-ensure-login'
import oauth2 from '../config/oauth2orize'
import { authorize } from '../middlewares'
import HomeController from '../controllers/home'
import AuthController from '../controllers/auth/auth'
import PasswordController from '../controllers/auth/password'
import UserController from '../controllers/api/user'
import ClientController from '../controllers/api/client'
import TokenController from '../controllers/api/token'

const homeController = HomeController()
const authController = AuthController()
const passwordController = PasswordController()
const userController = UserController()
const clientController = ClientController()
const tokenController = TokenController()

const wrap = fn => (...args) => fn(...args).catch(args[2])

const router = Router()

  .get('/oauth2/authorize', oauth2.authorization)
  .post('/oauth2/authorize', oauth2.decision)
  .post('/oauth2/token', oauth2.token)
  .get('/oauth2/token/info', tokenController.info)
  .get('/oauth2/token/revoke', tokenController.revoke)

  .get('/oauth2/users', authorize({ scope: 'oauth_user' }), wrap(userController.index))
  .post('/oauth2/users', authorize({ scope: 'oauth_user' }), wrap(userController.create))
  .get('/oauth2/users/:id', authorize({ scope: 'oauth_user' }), wrap(userController.get))
  .put('/oauth2/users/:id', authorize({ scope: 'oauth_user' }), wrap(userController.update))
  .delete('/oauth2/users/:id', authorize({ scope: 'oauth_user' }), wrap(userController.destroy))

  .get('/oauth2/clients', authorize({ scope: 'oauth_client' }), wrap(clientController.index))
  .post('/oauth2/clients', authorize({ scope: 'oauth_client' }), wrap(clientController.create))
  .get('/oauth2/clients/:id', authorize({ scope: 'oauth_client' }), wrap(clientController.get))
  .put('/oauth2/clients/:id', authorize({ scope: 'oauth_client' }), wrap(clientController.update))
  .delete('/oauth2/clients/:id', authorize({ scope: 'oauth_client' }), wrap(clientController.destroy))

  .get('/', ensureLoggedIn('/login'), homeController.index)
  .get('/signup', ensureLoggedOut('/'), authController.getSignup)
  .post('/signup', ensureLoggedOut('/'), authController.postSignup)
  .get('/login', ensureLoggedOut('/'), authController.getLogin)
  .post('/login', ensureLoggedOut('/'), authController.postLogin)
  .get('/logout', ensureLoggedIn('/'), authController.logout)
  .get('/password/forgot', ensureLoggedOut('/'), passwordController.getForgot)
  .post('/password/forgot', ensureLoggedOut('/'), passwordController.postForgot)
  .get('/password/reset/:token', ensureLoggedOut('/'), passwordController.getReset)
  .post('/password/reset/:token', ensureLoggedOut('/'), passwordController.postReset)

  .get('/*', (req, res) => res.render(req.url))

export default () => router

import { Router } from 'express'
import { main } from '../controllers'

const router = Router()

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

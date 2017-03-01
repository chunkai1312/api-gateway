import { Router } from 'express'
import main from './main'
import oauth2 from './oauth2'

const router = Router()

  .use('/oauth2', oauth2())
  .use('/', main())

export default () => router

import { Router } from 'express'
import main from './main'
import api from './api'
import oauth2 from './oauth2'

const router = Router()

router.use('/', main())
router.use('/api', api())
router.use('/oauth2', oauth2())

export default () => router

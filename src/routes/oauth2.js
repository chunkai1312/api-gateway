import { Router } from 'express'
import oauth2 from '../config/oauth2orize'
const router = Router()

router.get('/authorize', oauth2.authorization)
router.post('/authorize', oauth2.decision)
router.post('/token', oauth2.token)

export default () => router

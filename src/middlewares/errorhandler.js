import expressWinston from 'express-winston'
import { errors } from 'compose-middleware'
import config from '../config'
import winstonInstance from '../config/logger'

const errorLogger = (config.env === 'development')
  ? () => (err, req, res, next) => winstonInstance.error(err) || next(err)
  : () => expressWinston.errorLogger({ winstonInstance })

const errorhandler = () => (err, req, res, next) => {
  let status = err.status || err.statusCode || 500
  if (status < 400) status = 500
  res.statusCode = status
  res.json({ message: err.message })
}

const handlers = [
  errorLogger(),
  errorhandler()
]

if (config.env === 'test') handlers.shift()

export default () => errors(handlers)

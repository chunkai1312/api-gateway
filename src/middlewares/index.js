import morgan from 'morgan'
import compression from 'compression'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import flash from 'express-flash'
import cors from 'cors'
import helmet from 'helmet'
import methodOverride from 'method-override'
import passport from 'passport'
import { compose } from 'compose-middleware'
import expressWinston from 'express-winston'
import config from '../config'
import winstonInstance from '../config/logger'

const logger = (config.env === 'development')
  ? () => morgan('dev')
  : () => expressWinston.logger({ winstonInstance })

const middlewares = [
  logger(),
  compression(),
  cookieParser(),
  session(config.session),
  cors(),
  helmet(),
  methodOverride(),
  flash(),
  bodyParser.urlencoded({ extended: false }),
  bodyParser.json(),
  passport.initialize(),
  passport.session()
]

if (config.env === 'test') middlewares.shift()

export errorHandler from './errorhandler'
export validator from './validator'

export default () => compose(middlewares)

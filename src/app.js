import path from 'path'
import express from 'express'
import ReactEngine from 'react-engine'
import middlewares, { httpProxy, errorHandler } from './middlewares'
import routes from './routes'
import connectMongoDB from './config/mongoose'
import setupPassport from './config/passport'

global.navigator = global.navigator || {}
global.navigator.userAgent = global.navigator.userAgent || 'all'

const engine = ReactEngine.server.create({
  routes: require('./views/routes'),
  routesFilePath: path.join(__dirname, '/views/routes.js')
})

connectMongoDB()
setupPassport()

const app = express()

httpProxy(app)

app.engine('js', engine)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'js')
app.set('view', ReactEngine.expressView)
app.use(express.static(path.resolve(__dirname, '../public')))

app.use(middlewares())
app.use(routes())
app.use(errorHandler())

export default app

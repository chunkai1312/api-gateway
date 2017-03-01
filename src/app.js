import path from 'path'
import express from 'express'
import ejs from 'ejs'
import expressLayouts from 'express-ejs-layouts'
import middlewares, { httpProxy, errorHandler } from './middlewares'
import routes from './routes'
import connectMongoDB from './config/mongoose'
import setupPassport from './config/passport'

connectMongoDB()
setupPassport()

const app = express()

httpProxy(app)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'html')
app.engine('html', ejs.renderFile)
app.use(expressLayouts)
app.use(express.static(path.resolve(__dirname, '../static')))

app.use(middlewares())
app.use(routes())
app.use(errorHandler())

export default app

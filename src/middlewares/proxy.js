import proxy from 'http-proxy-middleware'
import { proxyTable } from '../config'
import auth from './auth'

export default (app) => {
  Object.keys(proxyTable).forEach(context => {
    const options = (typeof proxyTable[context] === 'string')
      ? { target: proxyTable[context], changeOrigin: true }
      : proxyTable[context]
    app.use(context, auth.isAuthorized(), proxy(context, options))
  })
}

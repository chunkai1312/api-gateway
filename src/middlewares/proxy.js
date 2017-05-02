import proxy from 'http-proxy-middleware'
import { proxyTable } from '../config'
import authorize from './authorize'

export default (app) => {
  Object.keys(proxyTable).forEach(context => {
    const options = (typeof proxyTable[context] === 'string')
      ? { target: proxyTable[context], changeOrigin: true }
      : proxyTable[context]
    app.use(context, authorize(options.authorize), proxy(context, options))
  })
}

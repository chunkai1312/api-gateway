import path from 'path'

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  host: process.env.HOST,

  baseUrl: process.env.BASE_URL,
  root: path.normalize(`${__dirname}/../..`),
  context: path.normalize(`${__dirname}/..`),

  mongoDB: {
    uri: process.env.MONGODB_URI,
    options: {}
  },

  redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST
  },

  session: {
    secret: 'ssBQv9iDLkBlmF9aL0EO5D0jK9Upr1Yc',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 }  // 14d
  },

  oauth2: {
    authorizationCode: { expiresIn: 300 },   // 300 seconds => 5 minutes
    accessToken: { expiresIn: 3600 },        // 3600 seconds => 1 hour
    refreshToken: { expiresIn: 3155760000 }  // 3155760000 seconds => 100 years
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    options: {}
  },

  mailer: {
    from: 'Shields <no-reply@example.com>',
    provider: 'mailgun',
    mailgun: { auth: { api_key: process.env.MAILGUN_SECRET, domain: process.env.MAILGUN_DOMAIN } }
  },

  /**
   * Set HTTP proxy for API services.
   *
   * @see https://github.com/chimurai/http-proxy-middleware#readme
   *
   * @example
   * proxyTable: {
   *   'business': {
   *     target: 'http://127.0.0.1:8081',
   *     changeOrigin: true,
   *     pathRewrite: { '^/business': '/api' },
   *
   *     // additional option, set to limit accessing
   *     authorize: {
   *       public: false,      // default = false
   *       trustedOnly: false  // default = false
   *       scope: 'business'   // default = ''
   *     }
   *   }
   * }
   */
  proxyTable: {}
}

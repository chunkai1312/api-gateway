import path from 'path'

export default {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8080,
  root: path.normalize(`${__dirname}/../..`),

  baseUrl: 'http://localhost:8080',

  session: {
    secret: 'ssBQv9iDLkBlmF9aL0EO5D0jK9Upr1Yc',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 }  // 14 days
  },

  oauth2: {
    authorizationCode: { expiresIn: 300 }, // 5 minutes
    accessToken: { expiresIn: 3600 },      // 1 hour
    refreshToken: { expiresIn: 52560000 }  // 100 years
  },

  jwt: {
    secret: 'AC207Av50AyRQrWW07tABl1832f70i8u',
    options: {}
  },

  mailer: {
    sender: { name: 'Shielder', address: 'no-reply@example.com' },
    sendgrid: { key: '' }
  },

  proxyTable: {}
}

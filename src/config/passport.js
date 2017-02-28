import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { BasicStrategy } from 'passport-http'
import { Strategy as ClientPasswordStrategy } from 'passport-oauth2-client-password'
import { Strategy as BearerStrategy } from 'passport-http-bearer'
import { OAuthUser, OAuthClient, OAuthToken } from '../models'

const local = new LocalStrategy(async (usernameOrEmail, password, done) => {
  try {
    const user = await OAuthUser.getByUsernameOrEmail(usernameOrEmail)
    if (!user) return done(null, false, { message: 'Password or username/email are incorrect' })
    const isAuthenticated = await user.authenticate(password)
    if (!isAuthenticated) return done(null, false, { message: 'Password or username are incorrect' })
    done(null, user)
  } catch (err) {
    done(err)
  }
})

const basic = new BasicStrategy(async (username, password, done) => {
  try {
    const client = await OAuthClient.findById(username)
    if (!client) return done(null, false)
    if (client.secret !== password) return done(null, false)
    done(null, client)
  } catch (err) {
    done(err)
  }
})

const oauth2ClientPassword = new ClientPasswordStrategy(async (clientId, clientSecret, done) => {
  try {
    const client = await OAuthClient.findById(clientId)
    if (!client) return done(null, false)
    if (client.secret !== clientSecret) return done(null, false)
    return done(null, client)
  } catch (err) {
    done(err)
  }
})

const bearer = new BearerStrategy(async (accessToken, done) => {
  try {
    const token = await OAuthToken.getByAccessToken(accessToken)
    if (!token) return done(null, false)

    if (!token.isValid()) {
      await token.remove()
      return done(null, false)
    }

    const client = await OAuthClient.findById(token.client)
    // if (client.trusted) return done(null, client, token)

    if (token.user !== null) {
      const user = await OAuthUser.findById(token.user)
      if (!user) return done(null, false)
      return done(null, user.toJSON(), token)
    }

    done(null, client.toJSON(), token)
  } catch (err) {
    done(err)
  }
})

export default function setupPassport () {
  passport.use(local)
  passport.use(basic)
  passport.use(oauth2ClientPassword)
  passport.use(bearer)
  passport.serializeUser((user, done) => done(null, user))
  passport.deserializeUser((user, done) => done(null, user))
}

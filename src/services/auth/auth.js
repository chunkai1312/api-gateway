import { randomBytes } from 'crypto'
import credential from 'credential'
import Mailer from '../../services/mailer'
import OAuthUserRepository from '../../repositories/oauth_user'

const container = {
  pw: credential(),
  mailer: new Mailer(),
  OAuthUser: OAuthUserRepository()
}

function AuthService (dependencies = container) {
  const { pw, mailer, OAuthUser } = dependencies

  const authService = {}

  const generatePasswordResetToken = async (user) => {
    const token = randomBytes(16).toString('hex')
    const expiresAt = Date.now() + (3600 * 1000)
    return { token, expiresAt }
  }

  authService.createUser = async ({ firstName, lastName, username, email, password }) => {
    const data = { username, password, email, profile: { firstName, lastName } }
    data.password = await pw.hash(password)
    const user = await OAuthUser.createUser(data)
    return user
  }

  authService.authenticate = async (identifier, password) => {
    const user = await OAuthUser.getUser(identifier)
    if (!user) return null
    const authenticated = await pw.verify(user.password, password)
    return authenticated ? user : null
  }

  authService.forgotPassword = async (email) => {
    const user = await OAuthUser.getUser(email)
    if (user) {
      const passwordReset = await generatePasswordResetToken()
      user.passwordReset = passwordReset
      await OAuthUser.save(user)
      mailer.sendPasswordResetEmail(user)
    }
    return user
  }

  authService.validatePasswordResetToken = async (token) => {
    const user = await OAuthUser.getUserByPasswordResetToken(token)
    return user
  }

  authService.resetPassword = async (token, password) => {
    const user = await OAuthUser.getUserByPasswordResetToken(token)
    if (user) {
      user.password = await pw.hash(password)
      user.passwordReset = {}
      await OAuthUser.save(user)
    }
    return user
  }

  return authService
}

export default AuthService

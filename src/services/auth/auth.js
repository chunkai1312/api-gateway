import { randomBytes } from 'crypto'
import credential from 'credential'
import Mailer from '../../services/mailer'
import OAuthUserModel from '../../models/oauth_user'

function AuthService (dependencies = { pw: credential(), mailer: new Mailer(), OAuthUser: OAuthUserModel }) {
  const { pw, mailer, OAuthUser } = dependencies

  const authService = {}

  const createPasswordResetToken = async (user) => {
    const token = randomBytes(16).toString('hex')
    const expiresAt = Date.now() + (3600 * 1000)
    user.passwordReset = { token, expiresAt }
    await user.save()
  }

  authService.createUser = async ({ firstName, lastName, username, email, password }) => {
    const user = new OAuthUser({ username, email, profile: { firstName, lastName } })
    user.password = await pw.hash(password)
    await user.save()
    return user
  }

  authService.authenticate = async (login, password) => {
    const user = await OAuthUser.findOne({ $or: [{ username: login }, { email: login }] })
    if (!user) return null
    const authenticated = await pw.verify(user.password, password)
    return authenticated ? user : null
  }

  authService.forgotPassword = async (email) => {
    const user = await OAuthUser.findOne({ email })
    if (user) {
      await createPasswordResetToken(user)
      mailer.sendPasswordResetEmail(user)
    }
    return user
  }

  authService.validatePasswordResetToken = async (token) => {
    const user = await OAuthUser
      .findOne({ 'passwordReset.token': token })
      .where('passwordReset.expiresAt').gt(Date.now())

    return user
  }

  authService.resetPassword = async (token, password) => {
    const user = await OAuthUser
      .findOne({ 'passwordReset.token': token })
      .where('passwordReset.expiresAt').gt(Date.now())

    if (user) {
      user.password = await pw.hash(password)
      user.passwordReset = {}
      await user.save()
    }

    return user
  }

  return authService
}

export default AuthService

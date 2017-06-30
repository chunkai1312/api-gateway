import { randomBytes } from 'crypto'
import credential from 'credential'
import MailerService from '../../services/mailer'
import OAuthUserRepository from '../../repositories/oauth_user'

const container = {
  pw: credential(),
  mailerService: new MailerService(),
  userRepo: OAuthUserRepository()
}

function AuthService (dependencies = container) {
  const { pw, mailer, userRepo } = dependencies

  const authService = {}

  const generatePasswordResetToken = async (user) => {
    const token = randomBytes(16).toString('hex')
    const expiresAt = Date.now() + (3600 * 1000)
    return { token, expiresAt }
  }

  authService.createUser = async ({ firstName, lastName, username, email, password }) => {
    const data = { username, password, email, profile: { firstName, lastName } }
    data.password = await pw.hash(password)
    const user = await userRepo.createUser(data)
    return user
  }

  authService.authenticate = async (identifier, password) => {
    const user = await userRepo.getUser(identifier)
    if (!user) return null
    const authenticated = await pw.verify(user.password, password)
    return authenticated ? user : null
  }

  authService.forgotPassword = async (email) => {
    const user = await userRepo.getUser(email)
    if (user) {
      const passwordReset = await generatePasswordResetToken()
      user.passwordReset = passwordReset
      await userRepo.save(user)
      mailer.sendPasswordResetEmail(user)
    }
    return user
  }

  authService.validatePasswordResetToken = async (token) => {
    const user = await userRepo.getUserByPasswordResetToken(token)
    return user
  }

  authService.resetPassword = async (token, password) => {
    const user = await userRepo.getUserByPasswordResetToken(token)
    if (user) {
      user.password = await pw.hash(password)
      user.passwordReset = {}
      await userRepo.save(user)
    }
    return user
  }

  return authService
}

export default AuthService

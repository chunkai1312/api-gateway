import OAuthUser from '../models/oauth_user'

function OAuthUserRepository (dependencies = { OAuthUser }) {
  const userRepository = {}

  userRepository.createUser = (user) => {
    return OAuthUser.create(user)
  }

  userRepository.getUser = (identifier) => {
    return OAuthUser.findOne({ $or: [{ username: identifier }, { email: identifier }] })
  }

  userRepository.getUserByPasswordResetToken = (token) => {
    return OAuthUser
      .findOne({ 'passwordReset.token': token })
      .where('passwordReset.expiresAt').gt(Date.now())
  }

  userRepository.save = (user) => {
    return user.save()
  }

  return userRepository
}

export default OAuthUserRepository

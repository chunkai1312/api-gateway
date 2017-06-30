import OAuthUser from '../../../src/models/oauth_user'

function OAuthUserRepository (dependencies = { OAuthUser }) {
  const userRepository = {}

  userRepository.createUser = (user) => {
    return new OAuthUser(user)
  }

  userRepository.getUser = (identifier) => {
    return new OAuthUser({ username: identifier, email: identifier })
  }

  userRepository.getUserByPasswordResetToken = (token) => {
    return new OAuthUser({ passwordReset: { token } })
  }

  userRepository.save = (user) => {
    return new OAuthUser(user)
  }

  return userRepository
}

export default OAuthUserRepository

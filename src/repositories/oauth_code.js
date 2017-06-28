import OAuthCode from '../models/oauth_code'

function OAuthCodeRepository (dependencies = { OAuthCode }) {
  const codeRepository = {}

  /**
   * Get authorization code.
   */
  codeRepository.getAuthorizationCode = (authorizationCode) => {
    return OAuthCode
      .findOneAndRemove({ authorizationCode })
      .populate('client')
      .populate('user')
      .exec()
  }

  /**
   * Save authorization code.
   */
  codeRepository.saveAuthorizationCode = (authCode) => {
    return OAuthCode.create(authCode)
  }

  return codeRepository
}

export default OAuthCodeRepository

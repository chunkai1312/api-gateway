import OAuthCode from '../../../src/models/oauth_code'

function OAuthCodeRepository (dependencies = { OAuthCode }) {
  const codeRepository = {}

  /**
   * Get authorization code.
   */
  codeRepository.getAuthorizationCode = (authorizationCode) => {
    return new OAuthCode({ authorizationCode })
  }

  /**
   * Save authorization code.
   */
  codeRepository.saveAuthorizationCode = (authCode) => {
    return new OAuthCode(authCode)
  }

  /**
   * Remove authorization code.
   */
  codeRepository.removeAuthorizationCode = (authorizationCode) => {
    return new OAuthCode({ authorizationCode })
  }

  return codeRepository
}

export default OAuthCodeRepository

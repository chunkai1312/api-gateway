import OAuthToken from '../models/oauth_token'

function OAuthTokenRepository (dependencies = { OAuthToken }) {
  const tokenRepository = {}

  /**
   * Get access token.
   */
  tokenRepository.getAccessToken = (accessToken) => {
    return OAuthToken.findOne({ accessToken })
  }

  /**
   * Get refresh token.
   */
  tokenRepository.getRefreshToken = (refreshToken) => {
    return OAuthToken.findOne({ refreshToken })
  }

  /**
   * Save access token
   */
  tokenRepository.saveAccessToken = (accessToken) => {
    return OAuthToken.create(accessToken)
  }

  /**
   * Save refresh token
   */
  tokenRepository.saveRefreshToken = (refreshToken) => {
    if (!refreshToken) return
    return OAuthToken.create(refreshToken)
  }

  /**
   * Remove refresh token
   */
  tokenRepository.removeRefreshToken = (refreshToken) => {
    return OAuthToken.findOneAndRemove({ refreshToken })
  }

  return tokenRepository
}

export default OAuthTokenRepository

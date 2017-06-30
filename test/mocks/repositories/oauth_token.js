import OAuthToken from '../../../src/models/oauth_token'

function OAuthTokenRepository (dependencies = { OAuthToken }) {
  const tokenRepository = {}

  /**
   * Get access token.
   */
  tokenRepository.getAccessToken = (accessToken) => {
    return new OAuthToken({ accessToken })
  }

  /**
   * Get refresh token.
   */
  tokenRepository.getRefreshToken = (refreshToken) => {
    return new OAuthToken({ refreshToken })
  }

  /**
   * Save access token.
   */
  tokenRepository.saveAccessToken = (accessToken) => {
    return new OAuthToken(accessToken)
  }

  /**
   * Save refresh token.
   */
  tokenRepository.saveRefreshToken = (refreshToken) => {
    if (!refreshToken) return
    return new OAuthToken(refreshToken)
  }

  /**
   * Remove refresh token.
   */
  tokenRepository.removeRefreshToken = (refreshToken) => {
    return new OAuthToken({ refreshToken })
  }

  return tokenRepository
}

export default OAuthTokenRepository

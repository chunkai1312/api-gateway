import OAuthToken, { verifyToken } from '../../models/oauth_token'

function TokenController (dependencies = {}) {
  const tokenController = {}

  /**
   * GET /oauth2/token/info
   * Validate a token.
   */
  tokenController.info = async (req, res) => {
    try {
      const accessToken = req.query.access_token
      verifyToken(accessToken)

      const token = await OAuthToken.findToken(accessToken)
      if (!token) throw new Error('Invalid token')

      const { clientId: audience, user: user_id, scope } = token.payload
      const expiresIn = Math.floor((token.expiresAt - Date.now()) / 1000)

      res.status(200).json({ audience, user_id, scope, expires_in: expiresIn })
    } catch (err) {
      res.status(400).json({ error: 'invalid_token' })
    }
  }

  /**
   * GET /oauth2/token/revoke
   * Revoke a token.
   */
  tokenController.revoke = async (req, res) => {
    try {
      const token = req.query.token
      verifyToken(token)

      const removedToken = await OAuthToken.removeToken(token)
      if (!removedToken) throw new Error('Invalid token')

      res.status(200).json({})
    } catch (err) {
      res.status(400).json({ error: 'invalid_token' })
    }
  }

  return tokenController
}

export default TokenController

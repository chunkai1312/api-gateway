import OAuthService from '../../services/oauth/oauth'

function TokenController (dependencies = { oauthService: OAuthService() }) {
  const { oauthService } = dependencies

  const tokenController = {}

  /**
   * GET /oauth2/token/info
   * Validate a token.
   */
  tokenController.info = async (req, res) => {
    try {
      const token = await oauthService.getAccessToken(req.query.access_token)
      const response = {
        audience: token.client,
        user_id: token.user,
        scope: token.scope,
        expires_in: Math.floor((token.expiresAt - Date.now()) / 1000)
      }
      res.status(200).json(response)
    } catch (e) {
      res.status(400).json({ error: 'invalid_token' })
    }
  }

  /**
   * GET /oauth2/token/revoke
   * Revoke a token.
   */
  tokenController.revoke = async (req, res) => {
    try {
      const token = await oauthService.getRefreshToken(req.query.token)
      await oauthService.revokeToken(token)
      res.status(200).json({})
    } catch (e) {
      res.status(400).json({ error: 'invalid_token' })
    }
  }

  return tokenController
}

export default TokenController

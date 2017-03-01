import passport from 'passport'

export default {

  /**
   * Checks the token is valid
   */
  isAuthorized: () => passport.authenticate('bearer', { session: false }),

  /**
   * Checks the token has the scope to access
   */
  hasScope: (scope) => [
    this.isAuthorized(),
    (req, res, next) => {
      const scopes = req.authInfo.scope.split(',')
      const hasScope = scopes.includes(scope)
      if (hasScope) next()
      res.status(401).end('Unauthorized')
    }
  ],

  /**
   * Checks the token is owned by trusted client
   */
  isTrustedClient () {
    return [
      this.isAuthorized(),
      (req, res, next) => {
        const token = req.authInfo
        if (token.isTrustedClient()) next()
        res.status(401).end('Unauthorized')
      }
    ]
  }

}

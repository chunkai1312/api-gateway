import passport from 'passport'

export default (options = { public: false, trustedOnly: false, scope: '' }) => {
  if (options.public) return (req, res, next) => next()

  return [
    passport.authenticate('bearer', { session: false }),
    (req, res, next) => {
      const user = req.user
      const token = req.authInfo

      // Checks the token is owned by trusted client
      if (options.trustedOnly) {
        return (user.trusted)
          ? next()
          : res.status(401).json({ message: 'Unauthorized' })
      }

      // Checks the token has the scope to access
      if (options.scope) {
        const scopes = token.scope.split(',')
        const hasScope = scopes.includes(options.scope)
        return (hasScope)
          ? next()
          : res.status(401).json({ message: 'Unauthorized' })
      }

      next()
    }
  ]
}

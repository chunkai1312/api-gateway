import passport from 'passport'

export default (options = { public: false, scope: '' }) => {
  if (options.public) return (req, res, next) => next()

  return [
    passport.authenticate('bearer', { session: false }),
    (req, res, next) => {
      const scopes = req.authInfo.scope && req.authInfo.scope.split(',')
      const hasScope = scopes.includes(options.scope)
      if (options.scope === '*') return next()
      if (hasScope) return next()
      res.status(401).json({ message: 'Unauthorized' })
    }
  ]
}

import { randomBytes } from 'crypto'
import mongoose from 'mongoose'
import credential from 'credential'
import jwt from 'jsonwebtoken'

const pw = credential()

const OAuthUserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String, hide: true },
  email: { type: String, unique: true },
  profile: {
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    mobile: { type: String }
  },
  passwordReset: {
    token: { type: String },
    expiresAt: { type: Date }
  }
}, { collection: 'oauth_users', timestamps: true })

OAuthUserSchema.set('toJSON', { getters: true, virtuals: true })
OAuthUserSchema.set('toObject', { getters: true, virtuals: true })

OAuthUserSchema.virtual('profile.name')
  .get(function () {
    return `${this.profile.firstName} ${this.profile.lastName}`
  })
  .set(function (value) {
    this.profile.firstName = value.substr(0, value.indexOf(' '))
    this.profile.lastName = value.substr(value.indexOf(' ') + 1)
  })

OAuthUserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()

  pw.hash(this.password).then(hash => {
    this.password = hash
    next()
  }).catch(err => next(err))
})

OAuthUserSchema.statics = {

  /**
   * Find an OAuthUser by username.
   *
   * @param  {string}   username - The username for querying.
   * @return {Promise}  Result of query.
   */
  findByUsername (username) {
    return this.findOne({ username })
  },

  /**
   * Find an OAuthUser by email.
   *
   * @param  {string}   email - The email address for querying.
   * @return {Promise}  Result of query.
   */
  findByEmail (email) {
    return this.findOne({ email })
  },

  /**
   * Find an OAuthUser by username or email.
   *
   * @param  {string}   usernameOrEmail - The username or email address for querying.
   * @return {Promise}  Result of query.
   */
  findByUsernameOrEmail (usernameOrEmail) {
    return this.findOne({ $or: [
      { username: usernameOrEmail },
      { email: usernameOrEmail }
    ]})
  },

  /**
   * Find an OAuthUser by password reset token.
   *
   * @param  {string}   token - The JWT Token.
   * @return {Promise}  Result of query.
   */
  findByPasswordResetToken (token) {
    const { sub, jti, exp } = jwt.decode(token) || {}

    return this.findOne({
      _id: sub,
      'passwordReset.token': jti,
      'passwordReset.expiresAt': exp * 1000
    }).where('passwordReset.expiresAt').gt(Date.now())
  }

}

OAuthUserSchema.methods = {

  /**
   * Authenticate a user.
   *
   * @param  {string}   password - The password of the user.
   * @return {Promise}  Returns true or false if without error.
   */
  authenticate (password) {
    return pw.verify(this.password, password)
  },

  /**
   * Change password of the user.
   *
   * @param  {string}   oldPassword - Current password of the user.
   * @param  {string}   newPassword - New password of the user.
   * @return {Promise}  Returns the user instance if changed password successfully,
   *                    or returns false if oldPassword is invalid.
   */
  changePassword (oldPassword, newPassword) {
    return new Promise((resolve, reject) => {
      this.authenticate(oldPassword)
        .then((isAuthenticated) => {
          if (!isAuthenticated) resolve(false)
          this.password = newPassword
          this.save((err, user) => {
            if (err) reject(false)
            resolve(true)
          })
        })
        .catch(() => reject(false))
    })
  },

  /**
   * Save password reset token.
   *
   * @param {String} token - The JWT Token.
   * @return {Promise}  Returns the user instance if saved token successfully,
   */
  savePasswordResetToken (token) {
    const { jti, exp } = jwt.decode(token)
    this.passwordReset.token = jti
    this.passwordReset.expiresAt = exp * 1000
    return this.save()
  },

  /**
   * Reset password of the user.
   *
   * @param {string}   newPassword - New password of the user.
   * @return {Promise} Returns the new password if without error.
   */
  resetPassword (newPassword) {
    this.password = newPassword
    this.passwordResetExpires = Date.now()
    return this.save()
  }

}

const User = mongoose.model('OAuthUser', OAuthUserSchema)

export default User

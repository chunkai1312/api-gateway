import mongoose from 'mongoose'
import credential from 'credential'
import { uid } from 'rand-token'

const pw = credential()

const OAuthUserSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthClient' },
  username: { type: String, unique: true },
  password: { type: String },
  email: { type: String, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date }
}, { collection: 'oauth_users', timestamps: true })

OAuthUserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret, options) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    delete ret.password
    delete ret.createdAt
    delete ret.updatedAt
  }
})

OAuthUserSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`
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
   * Get an OAuthUsers by provider.
   *
   * @param  {string}   provider - The OAuthClient id for querying.
   * @param  {Function} callback - The callback function for when query is complete.
   * @return {Promise}  Result of query.
   */
  getByProvider (provider, callback) {
    return this.find({ provider }, callback)
  },

  /**
   * Get an OAuthUser by username.
   *
   * @param  {string}   username - The username for querying.
   * @param  {Function} callback - The callback function for when query is complete.
   * @return {Promise}  Result of query.
   */
  getByUsername (username, callback) {
    return this.findOne({ username }, callback)
  },

  /**
   * Get an OAuthUser by email.
   *
   * @param  {string}   email - The email address for querying.
   * @param  {Function} callback - THe callback function for when query is complete.
   * @return {Promise}  Result of query.
   */
  getByEmail (email, callback) {
    return this.findOne({ email }, callback)
  },

  /**
   * Get an OAuthUser by username or email.
   *
   * @param  {string}   usernameOrEmail - The username or email address for querying.
   * @param  {Function} callback - THe callback function for when query is complete.
   * @return {Promise}  Result of query.
   */
  getByUsernameOrEmail (usernameOrEmail, callback) {
    return this.findOne({ $or: [
      { username: usernameOrEmail },
      { email: usernameOrEmail }
    ]}, callback)
  },

  /**
   * Get an OAuthUser by passwordResetToken.
   *
   * @param  {string}   passwordResetToken - The password reset token for querying.
   * @param  {Function} callback - The callback function for when query is complete.
   * @return {Promise}  Result of query.
   */
  getByPasswordResetToken (passwordResetToken, callback) {
    return this.findOne({ passwordResetToken }, callback)
      .where('passwordResetExpires').gt(Date.now())
      .exec(callback)
  },

  /**
   * Get an OAuthUser by invitationToken.
   *
   * @param  {string}   invitationToken - The invitation token for querying.
   * @param  {Function} callback - The callback function for when query is complete.
   * @return {Promise}  Result of query.
   */
  getByInvitationToken (invitationToken, callback) {
    return this.findOne({ invitationToken }, callback)
      .where('invitationExpires').gt(Date.now())
      .exec(callback)
  }

}

OAuthUserSchema.methods = {

  /**
   * Authenticate a user.
   *
   * @param  {string}   password - The password of the user.
   * @param  {Function} callback - The callback function for when authentication is complete.
   * @return {Promise}  Returns true or false if without error.
   */
  authenticate (password, callback) {
    return pw.verify(this.password, password, callback)
  },

  /**
   * Change password of the user.
   *
   * @param  {string}   oldPassword - Current password of the user.
   * @param  {string}   newPassword - New password of the user.
   * @param  {Function} callback - The callback function for when processing is complete.
   * @return {Promise}  Returns the user instance if changed password successfully,
   *                    or returns false if oldPassword is invalid.
   */
  changePassword (oldPassword, newPassword, callback = () => {}) {
    return new Promise((resolve, reject) => {
      this.authenticate(oldPassword)
        .then((isAuthenticated) => {
          if (!isAuthenticated) {
            resolve(false)
            return callback(null, false)
          }
          this.password = newPassword
          this.save((err, user) => {
            if (err) {
              reject(err)
              return callback(err)
            }
            resolve(user)
            return callback(user)
          })
        })
        .catch((err) => {
          reject(err)
          return callback(err)
        })
    })
  },

  /**
   * Generate password reset token.
   *
   * @param  {Function} callback - The callback function for when processing is complete.
   * @return {Promise}  Returns the new password if without error.
   */
  generatePasswordResetToken () {
    this.passwordResetToken = uid(32)
    this.passwordResetExpires = Date.now() + 3600 * 1000 // 1 hour
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

export default mongoose.model('OAuthUser', OAuthUserSchema)

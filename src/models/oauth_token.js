import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { uid } from 'rand-token'
import config from '../config'

const OAuthTokenSchema = new mongoose.Schema({
  tokenType: { type: String },
  accessToken: { type: String, unique: true },
  refreshToken: { type: String },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthClient', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthUser' },
  scope: { type: String },
  expiresAt: { type: Date }
}, { collection: 'oauth_tokens', timestamps: true })

OAuthTokenSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    delete ret.createdAt
    delete ret.updatedAt
  }
})

OAuthTokenSchema.virtual('expiresIn').get(function () {
  return (this.expiresAt.getTime() - this.createdAt.getTime()) / 1000
})

OAuthTokenSchema.pre('save', function (next) {
  if (!this.isNew) return next()

  this.tokenType = config.oauth2.tokenType
  this.accessToken = (config.oauth2.accessToken.isJWT)
    ? jwt.sign(this.user, config.jwt.secret, { expiresIn: config.oauth2.accessToken.expiresIn })
    : uid(config.oauth2.accessToken.length)

  this.expiresAt = new Date(
    this.createdAt.getTime() + config.oauth2.accessToken.expiresIn * 1000
  )

  if (this.refreshToken === null) return next()

  this.refreshToken = uid(config.oauth2.refreshToken.length)
  next()
})

OAuthTokenSchema.statics = {

  /**
   * Get an OAuthToken by access token.
   *
   * @param  {string}   accessToken - The accessToken for querying.
   * @param  {Function} callback - The callback function for when query is complete.
   * @return {Promise}  Result of query.
   */
  getByAccessToken (accessToken, callback) {
    return this.findOne({ accessToken }, callback)
  },

  /**
   * Get an OAuthToken by refresh token.
   *
   * @param  {string}   refreshToken - The refreshToken for querying.
   * @param  {Function} callback - The callback function for when query is complete.
   * @return {Promise}  Result of query.
   */
  getByRefreshToken (refreshToken, callback) {
    return this.findOne({ refreshToken }, callback)
  }

}

OAuthTokenSchema.methods = {

  /**
   * Check the access token is valid.
   *
   * @return {boolean} Result of check.
   */
  isValid () {
    return new Date() < this.expiresAt
  },

  /**
   * Get seconds for expiration.
   *
   * @return {number} seconds.
   */
  getExpiresIn () {
    return Math.floor((this.expiresAt.getTime() - Date.now()) / 1000)
  },

  /**
   * Check the token for trusted client.
   *
   * @return {boolean} Result of check.
   */
  isTrustedClient () {
    return (!this.user) && (!this.refreshToken)
  }

}

export default mongoose.model('OAuthToken', OAuthTokenSchema)

import mongoose from 'mongoose'
import { uid } from 'rand-token'
import config from '../config'

const OAuthCodeSchema = new mongoose.Schema({
  code: { type: String },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthClient', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthUser', required: true },
  redirectURI: { type: String },
  scope: { type: String },
  expiresAt: { type: Date }
}, { collection: 'oauth_codes', timestamps: true })

OAuthCodeSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret._id
    delete ret.__v
    delete ret.createdAt
    delete ret.updatedAt
  }
})

OAuthCodeSchema.pre('save', function (next) {
  if (!this.isNew) return next()
  this.code = uid(config.oauth2.authorizationCode.length)
  this.expiresAt = new Date(
    this.createdAt.getTime() + config.oauth2.authorizationCode.expiresIn * 1000
  )
  return next()
})

OAuthCodeSchema.statics = {

  /**
   * Get an OAuthCode by code.
   *
   * @param  {string}   code - The code for querying.
   * @param  {Function} callback - The callback function for when query is complete.
   * @return {Promise}  Result of query.
   */
  getByCode (code, callback) {
    return this.findOne({ code }, callback)
  }

}

OAuthCodeSchema.methods = {

  /**
   * Check the OAuthCode is valid.
   *
   * @return {boolean} Result of check.
   */
  isValid () {
    return new Date() < this.expiresAt
  },

  /**
   * Verify authorization code is valid.
   *
   * @param  {string} clientId - The client id.
   * @param  {string} redirectURI - Assigned redirect URI.
   * @return {boolean} Result of check.
   */
  verify (clientId, redirectURI) {
    if (!this.client.equals(clientId)) return false
    if (this.redirectURI !== redirectURI) return false
    return this.isValid()
  }

}

export default mongoose.model('OAuthCode', OAuthCodeSchema)

import mongoose from 'mongoose'
import { uid } from 'rand-token'
import config from '../config'

const OAuthClientSchema = new mongoose.Schema({
  secret: { type: String },
  redirectURIs: [{ type: String }],
  name: { type: String },
  trusted: { type: Boolean, default: false }
}, { collection: 'oauth_clients', timestamps: true })

OAuthClientSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    delete ret.createdAt
    delete ret.updatedAt
  }
})

OAuthClientSchema.pre('save', function (next) {
  if (!this.isNew) return next()
  this.secret = uid(config.oauth2.clientSecret.length)
  return next()
})

OAuthClientSchema.methods = {

  /**
   * Check redirect URI is valid.
   *
   * @param  {string} redirectURI - The redirect URI for checking.
   * @return {boolean} Result of check.
   */
  hasRedirectURI (redirectURI) {
    return this.redirectURIs.includes(redirectURI)
  }

}

export default mongoose.model('OAuthClient', OAuthClientSchema)

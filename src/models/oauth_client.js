import mongoose from 'mongoose'
import { uid } from 'rand-token'
import config from '../config'

const OAuthClientSchema = new mongoose.Schema({
  secret: { type: String },
  redirectURIs: [{ type: String }],
  name: { type: String },
  trusted: { type: Boolean, default: false }
}, { collection: 'oauth_clients', timestamps: true })

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

const OAuthClient = mongoose.model('OAuthClient', OAuthClientSchema)

export default OAuthClient

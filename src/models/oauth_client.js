import { randomBytes } from 'crypto'
import mongoose from 'mongoose'
import uuid from 'uuid/v4'

const OAuthClientSchema = new mongoose.Schema({
  clientId: { type: String, unique: true },
  clientSecret: { type: String },
  redirectURIs: [{ type: String }],
  name: { type: String },
  trusted: { type: Boolean, default: false }
}, { collection: 'oauth_clients', timestamps: true })

OAuthClientSchema.pre('save', function (next) {
  if (!this.isNew) return next()
  this.clientId = uuid()
  this.clientSecret = randomBytes(16).toString('hex')
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

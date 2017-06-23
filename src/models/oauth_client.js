import mongoose from 'mongoose'
import mongooseHidden from 'mongoose-hidden'
import mongooseDelete from 'mongoose-delete'

const OAuthClientSchema = new mongoose.Schema({
  clientId: { type: String, unique: true },
  clientSecret: { type: String },
  redirectUris: [{ type: String }],
  name: { type: String },
  trusted: { type: Boolean, default: false }
}, { collection: 'oauth_clients', timestamps: true })

OAuthClientSchema.set('toJSON', { getters: true, virtuals: true })
OAuthClientSchema.set('toObject', { getters: true, virtuals: true })

/**
 * Mongoose Hidden Plugin
 *
 * @see https://github.com/mblarsen/mongoose-hidden
 */
OAuthClientSchema.plugin(mongooseHidden(), {
  hidden: {
    createdAt: true,
    updatedAt: true
  }
})

/**
 * Mongoose Delete Plugin
 *
 * @see https://github.com/dsanel/mongoose-delete
 */
OAuthClientSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: true
})

export default mongoose.model('OAuthClient', OAuthClientSchema)

import mongoose from 'mongoose'
import mongooseHidden from 'mongoose-hidden'
import mongooseDelete from 'mongoose-delete'

const OAuthTokenSchema = new mongoose.Schema({
  accessToken: { type: String, unique: true },
  refreshToken: { type: String },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthClient', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthUser' },
  scope: { type: String },
  expiresAt: { type: Date, expires: 0 }
}, { collection: 'oauth_tokens', timestamps: true })

OAuthTokenSchema.set('toJSON', { getters: true, virtuals: true })
OAuthTokenSchema.set('toObject', { getters: true, virtuals: true })

/**
 * Mongoose Hidden Plugin
 *
 * @see https://github.com/mblarsen/mongoose-hidden
 */
OAuthTokenSchema.plugin(mongooseHidden(), {
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
OAuthTokenSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: true
})

export default mongoose.model('OAuthToken', OAuthTokenSchema)

import mongoose from 'mongoose'
import mongooseHidden from 'mongoose-hidden'
import mongooseDelete from 'mongoose-delete'

const OAuthCodeSchema = new mongoose.Schema({
  authorizationCode: { type: String },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthClient', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthUser', required: true },
  redirectUri: { type: String },
  scope: { type: String },
  expiresAt: { type: Date, expires: 0 }
}, { collection: 'oauth_codes', timestamps: true })

OAuthCodeSchema.set('toJSON', { getters: true, virtuals: true })
OAuthCodeSchema.set('toObject', { getters: true, virtuals: true })

/**
 * Mongoose Hidden Plugin
 *
 * @see https://github.com/mblarsen/mongoose-hidden
 */
OAuthCodeSchema.plugin(mongooseHidden(), {
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
OAuthCodeSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: true
})

export default mongoose.model('OAuthCode', OAuthCodeSchema)

import mongoose from 'mongoose'
import mongooseHidden from 'mongoose-hidden'
import mongooseDelete from 'mongoose-delete'

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
  },
  activated: { type: Boolean }
}, { collection: 'oauth_users', timestamps: true })

/* istanbul ignore next */
OAuthUserSchema.virtual('profile.name')
  .get(function () {
    return `${this.profile.firstName} ${this.profile.lastName}`
  })
  .set(function (value) {
    this.profile.firstName = value.substr(0, value.indexOf(' '))
    this.profile.lastName = value.substr(value.indexOf(' ') + 1)
  })

/**
 * @see https://github.com/mblarsen/mongoose-hidden
 */
OAuthUserSchema.set('toJSON', { getters: true, virtuals: true })
OAuthUserSchema.set('toObject', { getters: true, virtuals: true })

/**
 * Mongoose Hidden Plugin
 *
 * @see https://github.com/mblarsen/mongoose-hidden
 */
OAuthUserSchema.plugin(mongooseHidden(), {
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
OAuthUserSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: true
})

export default mongoose.model('OAuthUser', OAuthUserSchema)

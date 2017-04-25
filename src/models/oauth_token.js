import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import uuid from 'uuid/v4'
import config from '../config'

export const types = {
  AUTHORIZATION_CODE: 'AUTHORIZATION_CODE',
  ACCESS_TOKEN: 'ACCESS_TOKEN',
  REFRESH_TOKEN: 'REFRESH_TOKEN'
}

export const createToken = (options = { exp: 3600, sub: '' }) => {
  return jwt.sign({
    jti: uuid(),
    sub: options.sub,
    exp: Math.floor(Date.now() / 1000) + options.exp
  }, config.jwt.secret)
}

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret)
}

const OAuthTokenSchema = new mongoose.Schema({
  tokenId: { type: String, unique: true },
  type: { type: String, enum: Object.values(types) },
  payload: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthUser' },
    clientId: { type: String },
    redirectURI: { type: String }, // only for authorization code
    scope: { type: String },
    expiresAt: { type: Date }
  }
}, { collection: 'oauth_tokens', timestamps: true })

OAuthTokenSchema.statics = {

  saveToken (token, type, payload) {
    const tokenId = jwt.decode(token).jti
    return this.create({ tokenId, type, payload })
  },

  findToken (token) {
    const tokenId = jwt.decode(token).jti
    return this.findOne({ tokenId })
  },

  removeToken (token) {
    const tokenId = jwt.decode(token).jti
    return this.findOneAndRemove({ tokenId })
  }
}

const OAuthToken = mongoose.model('OAuthToken', OAuthTokenSchema)

export default OAuthToken


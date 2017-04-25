import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import uuid from 'uuid/v4'
import config from '../config'

export const types = {
  AUTHORIZATION_CODE: 'AUTHORIZATION_CODE',
  ACCESS_TOKEN: 'ACCESS_TOKEN',
  REFRESH_TOKEN: 'REFRESH_TOKEN'
}

/**
 * Creates a signed JSON WebToken and returns it.  Utilizes the private certificate to create
 * the signed JWT.  For more options and other things you can change this to, please see:
 * https://github.com/auth0/node-jsonwebtoken
 *
 * @param  {Number} expiresIn - The number of seconds for this token to expire.  By default it will be 60
 *                        minutes (3600 seconds) if nothing is passed in.
 * @param  {String} subject - The subject or identity of the token.
 * @return {String} The JWT Token
 */
export const createToken = (options = { expiresIn: 3600, subject: '' }) => {
  return jwt.sign({}, config.jwt.secret,
    { jwtid: uuid(), subject: options.subject, expiresIn: options.expiresIn })
}

/**
 * Verifies the token through the jwt library using the public certificate.
 *
 * @param   {String} token - The token to verify
 * @throws  {Error} Error if the token could not be verified
 * @returns {Object} The token decoded and verified
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret)
}

const OAuthTokenSchema = new mongoose.Schema({
  jwtId: { type: String, unique: true },
  type: { type: String, enum: Object.values(types) },
  payload: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthUser' },
    clientId: { type: String },
    redirectURI: { type: String },
    scope: { type: String }
  },
  expiresAt: { type: Date, expires: 0 }
}, { collection: 'oauth_tokens', timestamps: true })

OAuthTokenSchema.statics = {

  /**
   * Save token for JWT.
   *
   * @param {String} token - The JWT Token.
   * @param {String} type - The type for JWT.
   * @param {Object} payload - The payload data for the JWT.
   * @return {Promise} The created document.
   */
  saveToken (token, type, payload) {
    const { jti: jwtId, exp } = jwt.decode(token)
    const expiresAt = exp * 1000
    return this.create({ jwtId, type, payload, expiresAt })
  },

  /**
   * Find token by JWT.
   *
   * @param  {string} token - The JWT Token.
   * @return {Promise} The found document.
   */
  findToken (token) {
    const jwtId = jwt.decode(token).jti
    return this.findOne({ jwtId })
  },

  /**
   * Remove token by JWT.
   *
   * @param {string} token - The JWT Token.
   * @return {Promise} The removed document.
   */
  removeToken (token) {
    const jwtId = jwt.decode(token).jti
    return this.findOneAndRemove({ jwtId })
  }

}

OAuthTokenSchema.methods = {

  validateAuthorizationCode (token, client, redirectURI) {
    verifyToken(token)
    if (client.id !== this.payload.clientID) {
      throw new Error('AuthCode clientID does not match client id given');
    }
    if (redirectURI !== this.payload.redirectURI) {
      throw new Error('AuthCode redirectURI does not match redirectURI given');
    }
    return this
  },

  validateAccessToken (token) {
    verifyToken(token)
    return this
  },

  validateRefreshToken (token, client) {
    verifyToken(token)
    if (client.id !== this.payload.clientId) {
      throw new Error('RefreshToken clientID does not match client id given')
    }
    return this
  }
}

const OAuthToken = mongoose.model('OAuthToken', OAuthTokenSchema)

export default OAuthToken


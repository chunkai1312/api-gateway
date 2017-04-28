import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import sgTransport from 'nodemailer-sendgrid-transport'
import _ from 'lodash'
import config from '../../config'

const templateDir = path.join(__dirname, 'templates')
const mailer = nodemailer.createTransport(sgTransport({
  auth: { api_key: config.mailer.sendgrid.key }
}))

export default {

  /**
   * Send mail via SendGrid.
   *
   * @param  {Object}   options - The email options.
   * @param  {string}   options.to - The email address of the receiver.
   * @param  {string}   options.from - The email address of the sender.
   * @param  {string}   options.subject - The subject of the email.
   * @param  {string}   options.text - The plaintext body of the email.
   * @param  {string}   options.html - The HTML body of the email.
   * @return {Promise}  The result of sending mail.
   */
  send (options) {
    const from = `${config.mailer.sender.name} <${config.mailer.sender.address}>`
    options = Object.assign({ from }, options)
    return mailer.sendMail(options)
  },

  // /**
  //  * Send invitation mail via SendGrid.
  //  *
  //  * @param  {string}   to - The email address of the receiver.
  //  * @param  {string}   name - The name of the invitee.
  //  * @param  {string}   url - The registration url.
  //  * @return {Promise}  The result of sending mail.
  //  */
  // sendInvitation (invitation) {
  //   const template = fs.readFileSync(path.join(templateDir, 'invitation.html'), 'utf-8')
  //   const compiled = _.template(template)
  //   const html = compiled({ name: invitation.name, url: `${config.baseUrl}/signup/${invitation.token}` })
  //   const options = { to: invitation.email, html}
  //   options.subject = 'You are invited to join the Punwave DSP!'
  //   return this.send(options)
  // },

  /**
   * Send password reset mail via SendGrid.
   *
   * @param  {string}   to - The email address.
   * @param  {string}   name - The name of user.
   * @param  {string}   passwordResetToken - The password reset token of the user.
   * @return {Promise}  The result of sending mail.
   */
  sendPasswordReset (to, name, passwordResetToken) {
    const template = fs.readFileSync(path.join(templateDir, 'password_reset.html'), 'utf-8')
    const compiled = _.template(template)
    const html = compiled({ name, url: `${config.baseUrl}/password/reset/${passwordResetToken}` })
    const options = { to, html }
    options.subject = 'Reset your password'
    return this.send(options)
  }

}

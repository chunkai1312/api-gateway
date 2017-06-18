import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import mgTransport from 'nodemailer-mailgun-transport'
import _ from 'lodash'
import config, { mailer } from '../../config'

const templateDir = path.join(__dirname, 'templates')

class Mailer {
  constructor (config) {
    this.config = config || mailer
    this.transporter = nodemailer.createTransport(mgTransport(mailer[this.config.provider]))
  }

  /**
   * Send mail via Mailgun.
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
    const from = `${mailer.from.name} <${mailer.from.address}>`
    options = Object.assign({ from }, options)
    return this.transporter.sendMail(options)
  }

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

export default Mailer

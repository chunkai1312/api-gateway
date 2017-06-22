import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import mgTransport from 'nodemailer-mailgun-transport'
import _ from 'lodash'
import config from '../../config'

const templateDir = path.join(__dirname, 'templates')

function MailerService (options, dependencies = { nodemailer }) {
  const mailer = options || config.mailer
  const transporter = nodemailer.createTransport(mgTransport(mailer[mailer.provider]))

  const mailerService = {}

  /**
   * Send email.
   *
   * @param  {Object}   options - The email options.
   * @param  {string}   options.to - The email address of the receiver.
   * @param  {string}   options.from - The email address of the sender.
   * @param  {string}   options.subject - The subject of the email.
   * @param  {string}   options.text - The plaintext body of the email.
   * @param  {string}   options.html - The HTML body of the email.
   * @return {Promise}  The result of sending mail.
   */
  mailerService.send = (options) => {
    const from = `${mailer.from.name} <${mailer.from.address}>`
    options = Object.assign({ from }, options)
    return transporter.sendMail(options)
  }

  /**
   * Send password reset email.
   *
   * @param  {User}     user - The mail will be sent to.
   * @return {Promise}  The result of sending mail.
   */
  mailerService.sendPasswordResetEmail = (user) => {
    const { email: to, profile, passwordReset } = user
    const template = fs.readFileSync(path.join(templateDir, 'password_reset.html'), 'utf-8')
    const compiled = _.template(template)
    const html = compiled({ name: profile.name, url: `${config.baseUrl}/password/reset/${passwordReset.token}` })
    const options = { to, html }
    options.subject = 'Reset your password'
    return mailerService.send(options)
  }

  return mailerService
}

export default MailerService

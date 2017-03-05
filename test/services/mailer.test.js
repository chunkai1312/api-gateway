const chai = require('chai').use(require('chai-as-promised'))
const expect = chai.expect
import mailer from '../../app/services/mailer'
require('../../app')

describe('mailer', () => {
  describe('#send()', () => {
    it('should send mail and return message with success', () => {
      const mailOptions = {
        to: ['chunkai1312@gmail.com'],
        from: 'no-reply@punwave.com',
        subject: 'Hi there',
        text: 'Awesome sauce',
        html: '<b>Awesome sauce</b>'
      }
      const result = mailer.send(mailOptions)
      return expect(result.then(res => res.message)).to.eventually.equal('success')
    })
  })

  describe('#sendInvitation()', () => {
    it('should send invitation mail and return message with success', () => {
      const invitation = {
        email: 'chunkai1312@gmail.com',
        name: 'Chun-Kai Wang',
        token: 'abcdefghijklmnopqrstuvwxyz'
      }
      const result = mailer.sendInvitation(invitation)
      return expect(result.then(res => res.message)).to.eventually.equal('success')
    })
  })

  describe('#sendPasswordReset()', () => {
    it('should send password reset mail and return message with success', () => {
      const to = 'chunkai1312@gmail.com'
      const name = 'Chun-Kai Wang'
      const url = 'http://campaign.punwave.com/resetPassword?code=xxxxxxxxxxxxxxxx'
      const result = mailer.sendPasswordReset(to, name, url)
      return expect(result.then(res => res.message)).to.eventually.equal('success')
    })
  })
})

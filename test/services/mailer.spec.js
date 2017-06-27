import nodemailer from 'nodemailer'
import MailerService from '../../src/services/mailer'

const mockTransport = { sendMail: jest.fn(() => Promise.resolve('ok')) }
nodemailer.createTransport = jest.fn(() => mockTransport)

describe('MailerService', () => {
  describe('#send()', () => {
    it('should send mail and return message with success', async () => {
      const mailerService = MailerService()
      const options = {
        to: ['chunkai1312@gmail.com'],
        from: 'no-reply@punwave.com',
        subject: 'Hi there',
        text: 'Awesome sauce',
        html: '<b>Awesome sauce</b>'
      }
      const result = await mailerService.send(options)
      expect(nodemailer.createTransport).toHaveBeenCalled()
      expect(mockTransport.sendMail).toHaveBeenCalled()
      expect(result).toBe('ok')
    })
  })

  describe('#sendPasswordReset()', () => {
    it('should send password reset mail and return message with success', async () => {
      const mailerService = MailerService()
      const spy = jest.spyOn(mailerService, 'send')
      const user = {
        profile: { name: 'Test User' },
        email: 'test@example.com',
        passwordReset: { token: '1234567890' }
      }
      const result = await mailerService.sendPasswordResetEmail(user)
      expect(spy).toHaveBeenCalled()
      expect(result).toBe('ok')
    })
  })
})

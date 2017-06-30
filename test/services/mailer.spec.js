import nodemailer from 'nodemailer'
import MailerService from '../../src/services/mailer'

const mockTransport = { sendMail: jest.fn() }
nodemailer.createTransport = jest.fn(() => mockTransport)

function setup () {
  const settings = {
    from: 'sender@example.com',
    provider: 'mailgun',
    mailgun: { auth: { api_key: 'mailgun-api-key', domain: 'mailgun-domain' } }
  }
  return { settings }
}

describe('MailerService', () => {
  describe('#MailerService()', () => {
    const mailerService = MailerService()
    expect(mailerService).toBeInstanceOf(Object)
  })

  describe('#send()', () => {
    it('should send mail and return message with success', async () => {
      const { settings } = setup()

      const mailerService = MailerService(settings)
      const options = {
        to: ['receiver@example.com'],
        from: 'sender@example.com',
        subject: 'Hi there',
        text: 'Awesome sauce',
        html: '<b>Awesome sauce</b>'
      }
      await mailerService.send(options)

      expect(nodemailer.createTransport).toHaveBeenCalled()
      expect(mockTransport.sendMail).toHaveBeenCalledWith(options)
    })

    it('should should use default sender address if the sender did not assign', async () => {
      const { settings } = setup()

      const mailerService = MailerService(settings)
      const options = {
        to: ['receiver@example.com'],
        subject: 'Hi there',
        text: 'Awesome sauce',
        html: '<b>Awesome sauce</b>'
      }
      await mailerService.send(options)

      expect(nodemailer.createTransport).toHaveBeenCalled()
      expect(mockTransport.sendMail).toHaveBeenCalled()
      expect(mockTransport.sendMail.mock.calls[0][0].from).toBe(settings.from)
    })
  })

  describe('#sendPasswordReset()', () => {
    it('should send password reset mail and return message with success', async () => {
      const { settings } = setup()

      const mailerService = MailerService(settings)
      const spy = jest.spyOn(mailerService, 'send')
      const user = {
        profile: { name: 'Test User' },
        email: 'test@example.com',
        passwordReset: { token: '1234567890' }
      }
      await mailerService.sendPasswordResetEmail(user)

      expect(spy).toHaveBeenCalled()
      expect(spy.mock.calls[0][0].to).toBe(user.email)
    })
  })
})

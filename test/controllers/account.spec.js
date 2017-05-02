import request from 'supertest'
import app from '../../src/app'

describe('Account Controller:', () => {
  beforeAll(async () => {

  })

  afterAll(async () => {

  })

  describe('GET /login', () => {
    it('should respond 200 with login page', async () => {
      return request(app)
        .get('/login')
        .expect('Content-Type', /html/)
        .expect(200)
    })
  })

  describe('GET /signup', () => {
    it('should respond 200 with signup page', async () => {
      return request(app)
        .get('/signup')
        .expect('Content-Type', /html/)
        .expect(200)
    })
  })

  describe('GET /passoword/forgot', () => {
    it('should respond 200 with password forgot page', async () => {
      return request(app)
        .get('/passoword/forgot')
        .expect('Content-Type', /html/)
        .expect(200)
    })
  })

  describe('GET /passoword/reset', () => {
    it('should respond 200 with password forgot page', async () => {
      return request(app)
        .get('/passoword/reset')
        .expect('Content-Type', /html/)
        .expect(200)
    })
  })
})

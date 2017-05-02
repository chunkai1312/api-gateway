import request from 'supertest'
import app from '../../src/app'
import OAuthClient from '../../src/models/oauth_client'

describe('Client Controller:', () => {
  let client

  beforeAll(async () => {
    await OAuthClient.remove()
  })

  afterAll(async () => {
    await OAuthClient.remove()
  })

  describe('GET /oauth2/clients', () => {
    it('should respond 200 with JSON array', () => {
      return request(app)
        .get('/oauth2/clients')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => expect(res.body).toBeInstanceOf(Array))
    })
  })

  describe('POST /oauth2/clients', () => {
    it('should respond 200 with the newly created client', () => {
      return request(app)
        .post('/oauth2/clients')
        .send({ name: 'client' })
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res.body).toHaveProperty('clientId')
          expect(res.body).toHaveProperty('clientSecret')
          expect(res.body.name).toBe('client')
          client = res.body
        })
    })
  })

  describe('GET /oauth2/clients/:id', () => {
    it('should respond 200 with the requested client', () => {
      return request(app)
        .get(`/oauth2/clients/${client.id}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.id).toBe(client.id)
          expect(res.body.clientId).toBe(client.clientId)
          expect(res.body.clientSecret).toBe(client.clientSecret)
          expect(res.body.name).toBe(client.name)
        })
    })
  })

  describe('PUT /oauth2/clients/:id', () => {
    it('should respond 200 with the updated client', () => {
      return request(app)
        .put(`/oauth2/clients/${client.id}`)
        .send({ name: 'blah' })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.id).toBe(client.id)
          expect(res.body.clientId).toBe(client.clientId)
          expect(res.body.clientSecret).toBe(client.clientSecret)
          expect(res.body.name).toBe('blah')
        })
    })
  })

  describe('DELETE /oauth2/clients/:id', () => {
    it('should respond 200 with deleted id', () => {
      return request(app)
        .delete(`/oauth2/clients/${client.id}`)
        .expect(200)
        .then(res => {
          expect(res.body.id).toBe(client.id)
          expect(res.body.deleted).toBe(true)
        })
    })

    it('should respond 404 when the client does not exist', () => {
      return request(app)
        .delete(`/oauth2/clients/${client.id}`)
        .expect(404)
    })
  })
})

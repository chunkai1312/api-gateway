import { expect } from 'chai'
import request from 'supertest-as-promised'
import co from 'co'
import OAuthClient from '../app/models/oauth_client'
import OAuthToken from '../app/models/oauth_token'
import app from '../app'

describe('Client API:', () => {
  let trustedClient
  let token
  let client

  before(() => {
    return co(function * () {
      trustedClient = yield OAuthClient.create({
        redirectURIs: ['https://localhost/callback'],
        name: 'Test Client',
        trusted: true
      })
      token = yield OAuthToken.create({
        refreshToken: null,
        user: null,
        client: trustedClient.id
      })
    })
  })

  after(() => {
    return Promise.all([trustedClient.remove(), token.remove()])
  })

  describe('GET /api/clients', () => {
    it('should respond with JSON array', () => {
      return request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => expect(res.body).to.be.instanceOf(Array))
    })
  })

  describe('POST /api/clients', () => {
    it('should respond with the newly created client', () => {
      return request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          name: 'client'
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          client = res.body
          expect(client).to.have.property('id')
          expect(client).to.have.property('secret')
          expect(client).to.have.property('name').that.equal('client')
        })
    })
  })

  describe('GET /api/clients/:id', () => {
    it('should respond with the requested client', () => {
      return request(app)
        .get(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.id).to.equal(client.id)
          expect(res.body.secret).to.equal(client.secret)
          expect(res.body.name).to.equal(client.name)
        })
    })
  })

  describe('PUT /api/clients/:id', () => {
    it('should respond with the updated client', () => {
      return request(app)
        .put(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          name: 'blah'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.id).to.equal(client.id)
          expect(res.body.secret).to.equal(client.secret)
          expect(res.body.name).to.equal('blah')
        })
    })
  })

  describe('DELETE /api/clients/:id', () => {
    it('should respond with 204 on successful removal', () => {
      return request(app)
        .delete(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect(204)
    })

    it('should respond with 404 when client does not exist', () => {
      return request(app)
        .delete(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect(404)
    })
  })
})

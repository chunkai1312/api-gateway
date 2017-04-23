import { expect } from 'chai'
import request from 'supertest-as-promised'
import co from 'co'
import OAuthClient from '../app/models/oauth_client'
import OAuthToken from '../app/models/oauth_token'
import app from '../app'

describe('User API:', () => {
  let trustedClient
  let token
  let user

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

  describe('GET /api/users', () => {
    it('should respond with JSON array', () => {
      return request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => expect(res.body).to.be.instanceOf(Array))
    })
  })

  describe('POST /api/users', () => {
    it('should respond with the newly created user', () => {
      return request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          username: 'test',
          password: 'password',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          user = res.body
          expect(user.username).to.equal('test')
          expect(user.email).to.equal('test@example.com')
          expect(user.firstName).to.equal('Test')
          expect(user.lastName).to.equal('User')
        })
    })
  })

  describe('GET /api/users/:id', () => {
    it('should respond with the requested user', () => {
      return request(app)
        .get(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.username).to.equal(user.username)
          expect(res.body.email).to.equal(user.email)
          expect(res.body.firstName).to.equal(user.firstName)
          expect(res.body.lastName).to.equal(user.lastName)
        })
    })
  })

  describe('PUT /api/users/:id', () => {
    it('should respond with the updated user', () => {
      return request(app)
        .put(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          firstName: 'Foo',
          lastName: 'Bar'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.username).to.equal(user.username)
          expect(res.body.email).to.equal(user.email)
          expect(res.body.firstName).to.equal('Foo')
          expect(res.body.lastName).to.equal('Bar')
        })
    })
  })

  describe('DELETE /api/users/:id', () => {
    it('should respond with 204 on successful removal', () => {
      return request(app)
        .delete(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect(204)
    })

    it('should respond with 404 when user does not exist', () => {
      request(app)
        .delete(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect(404)
    })
  })
})

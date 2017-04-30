import request from 'supertest'
import app from '../../src/app'
import OAuthUser from '../../src/models/oauth_user'

describe('OAuth User API:', () => {
  let user

  beforeAll(async () => {
    await OAuthUser.remove()
  })

  afterAll(async () => {
    await OAuthUser.remove()
  })

  describe('GET /oauth2/users', () => {
    it('should respond 200 with JSON array', () => {
      return request(app)
        .get('/oauth2/users')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => expect(res.body).toBeInstanceOf(Array))
    })
  })

  describe('POST /oauth2/users', () => {
    it('should respond 200 with the newly created user', () => {
      const body = {
        username: 'test',
        password: '123qwe',
        email: 'test@example.com'
      }
      return request(app)
        .post('/oauth2/users')
        .send(body)
        .expect('Content-Type', /json/)
        .expect(201)
        .then(res => {
          expect(res.body.username).toBe(body.username)
          expect(res.body.password).toBeUndefined()
          expect(res.body.email).toBe(body.email)
          user = res.body
        })
    })
  })

  describe('GET /oauth2/users/:id', () => {
    it('should respond 200 with the requested user', () => {
      return request(app)
        .get(`/oauth2/users/${user.id}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.id).toBe(user.id)
          expect(res.body.username).toBe(user.username)
          expect(res.body.password).toBe(user.password)
          expect(res.body.email).toBe(user.email)
        })
    })
  })

  describe('PUT /oauth2/users/:id', () => {
    it('should respond 200 with the updated user', () => {
      const body = { ...user, email: 'blah@example.com' }
      return request(app)
        .put(`/oauth2/users/${user.id}`)
        .send(body)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body.id).toBe(user.id)
          expect(res.body.username).toBe(user.username)
          expect(res.body.password).toBe(user.password)
          expect(res.body.email).toBe('blah@example.com')
        })
    })
  })

  describe('DELETE /oauth2/users/:id', () => {
    it('should respond 200 with deleted id', () => {
      return request(app)
        .delete(`/oauth2/users/${user.id}`)
        .expect(200)
        .then(res => {
          expect(res.body.id).toBe(user.id)
          expect(res.body.deleted).toBe(true)
        })
    })

    it('should respond 404 when the user does not exist', () => {
      return request(app)
        .delete(`/oauth2/users/${user.id}`)
        .expect(404)
    })
  })
})

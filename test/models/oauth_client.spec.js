import connectMongoDB from '../../src/config/mongoose'
import OAuthClient from '../../src/models/oauth_client'

connectMongoDB()

describe('OAuthClient Model:', () => {
  const testClient = { redirectURIs: ['https://www.example.com/callback'], name: 'Test Client' }

  beforeEach(async () => {
    await OAuthClient.remove()
  })

  afterEach(async () => {
    await OAuthClient.remove()
  })

  describe('OAuthClientSchema.statics', () => {
    describe('#create()', () => {
      it('should return an OAuthClient with property secret', async () => {
        const client = await OAuthClient.create(testClient)
        expect(client.toJSON()).toHaveProperty('secret')
        expect(client.toObject()).toHaveProperty('secret')
      })

      it('should return an OAuthClient with property trusted that is false', async () => {
        const client = await OAuthClient.create(testClient)
        expect(client.trusted).toBe(false)
      })
    })
  })

  describe('OAuthClientSchema.methods', () => {
    describe('#save()', () => {
      it('should return an OAuthClient with property secret', async () => {
        const client = await OAuthClient.create(testClient)
        expect(client.toJSON()).toHaveProperty('secret')
        expect(client.toObject()).toHaveProperty('secret')
      })
    })

    describe('#hasRedirectURI()', () => {
      it('should return true if redirectURI is found', async () => {
        const client = await OAuthClient.create(testClient)
        expect(client.hasRedirectURI(client.redirectURIs[0])).toBe(true)
      })

      it('should return false if redirectURI is not found', async () => {
        const client = await OAuthClient.create(testClient)
        expect(client.hasRedirectURI('http://www.blah.com/callback')).toBe(false)
      })
    })
  })
})

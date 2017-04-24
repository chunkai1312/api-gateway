import connectMongoDB from '../../src/config/mongoose'
import OAuthClient from '../../src/models/oauth_client'
// import clients from '../fixtures/oauth_client.json'

connectMongoDB()

describe('OAuthClient Model:', () => {
  const testClient = { redirectURIs: ['https://www.example.com/callback'], name: 'Test Client' }

  beforeAll(async () => {
    await OAuthClient.remove()
    // await OAuthClient.create(clients)
  })

  afterAll(async () => {
    await OAuthClient.remove()
  })

  describe('OAuthClientSchema.statics', () => {
    describe('#create()', () => {
      it('should return an OAuthClient with property clientId and clientSecret', async () => {
        const client = await OAuthClient.create(testClient)
        expect(client.toJSON()).toHaveProperty('clientId')
        expect(client.toJSON()).toHaveProperty('clientSecret')
        expect(client.toObject()).toHaveProperty('clientId')
        expect(client.toObject()).toHaveProperty('clientSecret')
      })

      it('should return an OAuthClient with property trusted that is false', async () => {
        const client = await OAuthClient.create(testClient)
        expect(client.trusted).toBe(false)
      })
    })
  })

  describe('OAuthClientSchema.methods', () => {
    describe('#save()', () => {
      it('should return an OAuthClient with property clientId and clientSecret', async () => {
        const client = await new OAuthClient(testClient).save()
        expect(client.toJSON()).toHaveProperty('clientId')
        expect(client.toJSON()).toHaveProperty('clientSecret')
        expect(client.toObject()).toHaveProperty('clientId')
        expect(client.toObject()).toHaveProperty('clientSecret')
      })

      it('should return an OAuthClient with property trusted that is false', async () => {
        const client = await new OAuthClient(testClient).save()
        expect(client.trusted).toBe(false)
      })
    })

    describe('#hasRedirectURI()', () => {
      it('should return true if redirectURI is found', async () => {
        const client = await new OAuthClient(testClient).save()
        expect(client.hasRedirectURI(client.redirectURIs[0])).toBe(true)
      })

      it('should return false if redirectURI is not found', async () => {
        const client = await new OAuthClient(testClient).save()
        expect(client.hasRedirectURI('http://www.blah.com/callback')).toBe(false)
      })
    })
  })
})

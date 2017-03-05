import { expect } from 'chai'
import { OAuthClient } from '../../src/models'
import connectMongoDB from '../../src/config/mongoose'

connectMongoDB()

describe('OAuthClient Model:', () => {
  const clientSeed = {
    redirectURIs: ['https://www.example.com/callback'],
    name: 'Test Client'
  }

  describe('OAuthClientSchema.statics', () => {
    describe('#create()', () => {
      let client

      before(() => {
        return OAuthClient.create(clientSeed).then(oauthClient => {
          client = oauthClient
        })
      })

      after(() => {
        return client.remove()
      })

      it('should return an OAuthClient with property secret', () => {
        expect(client).to.have.property('secret')
        expect(client.secret).to.have.length(32)
      })

      it('should return an OAuthClient with property trusted that is false', () => {
        expect(client.trusted).to.be.false
      })
    })
  })

  describe('OAuthClientSchema.methods', () => {
    let client

    before(() => {
      return new OAuthClient(clientSeed).save().then(oauthClient => {
        client = oauthClient
      })
    })

    after(() => {
      return client.remove()
    })

    describe('#save()', () => {
      it('should return an OAuthClient with property secret', () => {
        expect(client).to.have.property('secret')
        expect(client.secret).to.have.length(32)
      })
    })

    describe('#hasRedirectURI()', () => {
      it('should return true if redirectURI is found', () => {
        expect(client.hasRedirectURI(client.redirectURIs[0])).to.be.true
      })

      it('should return false if redirectURI is not found', () => {
        expect(client.hasRedirectURI('http://www.blah.com/callback')).to.be.false
      })
    })
  })
})

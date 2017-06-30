import OAuthClient from '../../../src/models/oauth_client'

function OAuthClientRepository (dependencies = { OAuthClient }) {
  const clientRepository = {}

  clientRepository.getClient = (clientId, clientSecret) => {
    return new OAuthClient({ clientId, clientSecret })
  }

  return clientRepository
}

export default OAuthClientRepository

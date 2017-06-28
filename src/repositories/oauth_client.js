import OAuthClient from '../models/oauth_client'

function OAuthClientRepository (dependencies = { OAuthClient }) {
  const clientRepository = {}

  clientRepository.getClient = (clientId, clientSecret) => {
    const query = clientSecret ? { clientId, clientSecret } : { clientId }
    return OAuthClient.findOne(query)
  }

  return clientRepository
}

export default OAuthClientRepository

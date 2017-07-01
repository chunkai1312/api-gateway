import { randomBytes } from 'crypto'
import uuid from 'uuid/v4'
import OAuthClient from '../../models/oauth_client'

function ClientService (dependencies = {}) {
  const clientService = {}

  clientService.getClients = async (query) => {
    const clients = await OAuthClient.find(query)
    return clients
  }

  clientService.getClientById = async (id) => {
    const client = await OAuthClient.findOne({ clientId: id })
    return client
  }

  clientService.createClient = async (doc) => {
    const client = new OAuthClient(doc)
    client.clientId = uuid()
    client.clientSecret = randomBytes(16).toString('hex')
    await client.save()
    return client
  }

  clientService.updateClient = async (id, doc) => {
    const client = await OAuthClient.findByIdAndUpdate(id, doc, { new: true })
    return client
  }

  clientService.deleteClient = async (id) => {
    const client = await OAuthClient.findById(id)
    if (client) await client.delete()
    return client
  }

  return clientService
}

export default ClientService

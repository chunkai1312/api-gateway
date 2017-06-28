import error from 'http-errors'
import ClientService from '../../services/oauth/client'

function ClientController (dependencies = { clientService: ClientService() }) {
  const { clientService } = dependencies

  const clientController = {}

  /**
   * GET /oauth2/clients
   * Find all clients.
   */
  clientController.index = async (req, res) => {
    const clients = await clientService.getClients()
    res.status(200).json(clients)
  }

  /**
   * POST /oauth2/clients
   * Create a new client.
   */
  clientController.create = async (req, res) => {
    const client = await clientService.createClient(req.body)
    res.status(201).json(client)
  }

  /**
   * GET /oauth2/clients/:id
   * Find one client by ID.
   */
  clientController.show = async (req, res) => {
    const client = await clientService.getClientById(req.params.id)
    if (!client) throw error(404)
    res.status(200).json(client)
  }

  /**
   * PUT /oauth2/clients/:id
   * Update an existing client by ID.
   */
  clientController.update = async (req, res) => {
    const client = await clientService.updateClient(req.params.id, req.body)
    if (!client) throw error(404)
    res.status(200).json(client)
  }

  /**
   * DELETE /oauth2/clients/:id
   * Destroy an existing client by ID.
   */
  clientController.destroy = async (req, res) => {
    const client = await clientService.deleteClient(req.params.id)
    if (!client) throw error(404)
    res.status(200).json({ id: client.id, deleted: true })
  }

  return clientController
}

export default ClientController

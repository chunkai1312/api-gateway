import error from 'http-errors'
import { OAuthClient } from '../models'

export default {

  index: async (req, res) => {
    const clients = await OAuthClient.find()
    res.status(200).json(clients)
  },

  create: async (req, res) => {
    const client = await OAuthClient.create(req.body)
    res.status(201).json(client)
  },

  show: async (req, res) => {
    const client = await OAuthClient.findById(req.params.id)
    if (!client) throw error(404)
    res.status(200).json(client)
  },

  update: async (req, res) => {
    const client = await OAuthClient.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!client) throw error(404)
    res.status(200).json(client)
  },

  destroy: async (req, res) => {
    const client = await OAuthClient.findByIdAndRemove(req.params.id)
    if (!client) throw error(404)
    res.status(204).end()
  }

}


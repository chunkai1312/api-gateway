import error from 'http-errors'
import { OAuthClient } from '../models'

export async function index (req, res) {
  const clients = await OAuthClient.find()
  res.status(200).json(clients)
}

export async function create (req, res) {
  const client = await OAuthClient.create(req.body)
  res.status(201).json(client)
}

export async function show (req, res) {
  const client = await OAuthClient.findById(req.params.id)
  if (!client) throw error(404)
  res.status(200).json(client)
}

export async function update (req, res) {
  const client = await OAuthClient.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!client) throw error(404)
  res.status(200).json(client)
}

export async function destroy (req, res) {
  const client = await OAuthClient.findByIdAndRemove(req.params.id)
  if (!client) throw error(404)
  res.status(204).end()
}


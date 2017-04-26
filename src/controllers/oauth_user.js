import error from 'http-errors'
import mailer from '../services/mailer'
import { OAuthUser } from '../models'
// import Invitation from '../models/invitation'
// import notifier from '../services/slack_notifier'
// import config from '../config'

export async function index (req, res) {
  const users = await OAuthUser.find()
  res.status(200).json(users)
}

export async function create (req, res) {
  let user
  user = await OAuthUser.findByUsername(req.body.username)
  if (user) throw error(406)
  user = await OAuthUser.findByEmail(req.body.email)
  if (user) throw error(406)
  user = await OAuthUser.create(Object.assign(req.body, { provider: req.authInfo.client }))
  res.status(201).json(user)
}

export async function show (req, res) {
  const user = await OAuthUser.findById(req.params.id)
  if (!user) throw error(404)
  res.status(200).json(user)
}

export async function update (req, res) {
  const user = await OAuthUser.findById(req.params.id)
  if (!user) throw error(404)
  user.firstName = req.body.firstName
  user.lastName = req.body.lastName
  await user.save()
  res.status(200).json(user)
}

export async function destroy (req, res) {
  const user = await OAuthUser.findByIdAndRemove(req.params.id)
  if (!user) throw error(404)
  res.status(204).end()
}

export async function changePassword (req, res) {
  const user = await OAuthUser.findById(req.params.id)
  if (!user) throw error(404)
  const isAuthenticated = await user.authenticate(req.body.oldPassword)
  if (!isAuthenticated) throw error(400)
  user.password = req.body.newPassword
  await user.save()
  res.status(204).end()
}

// export async function invite (req, res) {
//   const user = await OAuthUser.findByEmail(req.body.email)
//   if (user) return res.json(user)

//   let invitation = await Invitation.findByEmail(req.body.email)
//   if (!invitation) invitation = new Invitation()
//   invitation.name = req.body.name
//   invitation.email = req.body.email
//   await invitation.save()

//   const result = await mailer.sendInvitation(invitation)
//   if (result.message !== 'success') throw error(500)

//   notifier.success({
//     author_name: config.baseUrl,
//     title: 'Send Invitation Mail',
//     text: [
//       { title: 'Registration URL', code: `${config.baseUrl}/signup/${invitation.token}` },
//       { title: 'Invitation Infomation', code: invitation }
//     ]
//   })
//   return res.status(200).json(invitation)
// }

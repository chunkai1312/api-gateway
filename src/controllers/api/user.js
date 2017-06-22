import error from 'http-errors'
import { Types } from 'mongoose'
import OAuthUser from '../../models/oauth_user'

function UserController (dependencies = {}) {
  const userController = {}

  /**
   * GET /oauth2/users
   * Find all users.
   */
  userController.index = async (req, res) => {
    const users = await OAuthUser.find()
    res.status(200).json(users)
  }

  /**
   * POST /oauth2/users
   * Create a new user.
   */
  userController.create = async (req, res) => {
    const userByUsername = await OAuthUser.findByUsername(req.body.username)
    if (userByUsername) return res.status(400).json({ message: 'Username already exists' })

    const userByEmail = await OAuthUser.findByEmail(req.body.email)
    if (userByEmail) return res.status(400).json({ message: 'Email already in use' })

    const user = await OAuthUser.create(req.body)
    res.status(201).json(user)
  }

  /**
   * GET /oauth2/users/:id
   * Find one user by ID.
   */
  userController.show = async (req, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) throw error(404)
    const user = await OAuthUser.findById(req.params.id)
    if (!user) throw error(404)
    res.status(200).json(user)
  }

  /**
   * PUT /oauth2/users/:id
   * Update an existing user by ID.
   */
  userController.update = async (req, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) throw error(404)
    const user = await OAuthUser.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!user) throw error(404)
    res.status(200).json(user)
  }

  /**
   * DELETE /oauth2/users/:id
   * Destroy an existing user by ID.
   */
  userController.destroy = async (req, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) throw error(404)
    const user = await OAuthUser.findByIdAndRemove(req.params.id)
    if (!user) throw error(404)
    res.status(200).json({ id: user.id, deleted: true })
  }

  /**
   * PUT /oauth2/users/:id/password
   * Change password of the user.
   */
  userController.changePassword = async (req, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) throw error(404)
    const user = await OAuthUser.findById(req.params.id)
    if (!user) throw error(404)
    const isAuthenticated = await user.authenticate(req.body.oldPassword)
    if (!isAuthenticated) throw error(400)
    user.password = req.body.newPassword
    await user.save()
    res.status(204).end()
  }

  return userController
}

export default UserController

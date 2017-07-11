import error from 'http-errors'
import UserService from '../../services/oauth/user'

function UserController (dependencies = { userService: UserService() }) {
  const { userService } = dependencies

  const userController = {}

  /**
   * GET /oauth2/users
   * Find all users.
   */
  userController.index = async (req, res) => {
    const users = await userService.getUsers()
    res.status(200).json(users)
  }

  /**
   * POST /oauth2/users
   * Create a new user.
   */
  userController.create = async (req, res) => {
    const user = await userService.createUser(req.body)
    res.status(201).json(user)
  }

  /**
   * GET /oauth2/users/:id
   * Find one user by ID.
   */
  userController.show = async (req, res) => {
    const user = await userService.getUserById(req.params.id)
    if (!user) throw error(404)
    res.status(200).json(user)
  }

  /**
   * PUT /oauth2/users/:id
   * Update an existing user by ID.
   */
  userController.update = async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body)
    if (!user) throw error(404)
    res.status(200).json(user)
  }

  /**
   * DELETE /oauth2/users/:id
   * Destroy an existing user by ID.
   */
  userController.destroy = async (req, res) => {
    const user = await userService.deleteUser(req.params.id)
    if (!user) throw error(404)
    res.status(200).json({ id: user.id, deleted: true })
  }

  return userController
}

export default UserController

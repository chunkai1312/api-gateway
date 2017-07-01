import OAuthUser from '../../models/oauth_user'

function UserService (dependencies = {}) {
  const userService = {}

  userService.getUsers = async (query) => {
    const users = await OAuthUser.find(query)
    return users
  }

  userService.getUserById = async (id) => {
    const user = await OAuthUser.findOne({ userId: id })
    return user
  }

  userService.createUser = async (doc) => {
    const user = new OAuthUser(doc)
    await user.save()
    return user
  }

  userService.updateUser = async (id, doc) => {
    const user = await OAuthUser.findByIdAndUpdate(id, doc, { new: true })
    return user
  }

  userService.deleteUser = async (id) => {
    const user = await OAuthUser.findById(id)
    if (user) await user.delete()
    return user
  }

  return userService
}

export default UserService

// import config from '../config'

function HomeController (dependencies = {}) {
  const homeController = {}

  /**
   * Get /
   * Home page.
   */
  homeController.index = async (req, res) => {
    res.json(req.user)
  }

  return homeController
}

export default HomeController

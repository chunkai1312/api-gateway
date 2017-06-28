import httpMocks from 'node-mocks-http'
import HomeController from '../../src/controllers/home'

describe('HomeController', () => {
  it('should respond 200 with user data', async () => {
    const req = httpMocks.createRequest({ method: 'GET', url: '/' })
    const res = httpMocks.createResponse()

    const homeController = HomeController()
    await homeController.index(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(res._isJSON()).toBe(true)
  })
})

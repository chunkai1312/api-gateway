import validate from 'express-validation'
import Joi from 'joi'

export default {

  signup: () => validate({
    body: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      username: Joi.string().lowercase().required(),
      email: Joi.string().email().required(),
      password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
      confirm: Joi.string().required().valid(Joi.ref('password'))
    }
  }),

  login: () => validate({
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
    }
  })

}

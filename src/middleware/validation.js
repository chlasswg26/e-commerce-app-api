const { validationResult } = require('express-validator')
const helper = require('../helper')

const validate = validations => {
  return async (request, response, next) => {
    for (const validation of validations) {
      const result = await validation.run(request)

      if (result.errors.length) break
    }

    const errors = validationResult(request)

    if (errors.isEmpty()) {
      return next()
    }

    helper.imageRemover(request)

    return helper.response(response, 400, {
      message: errors.array()
    })
  }
}

module.exports = validate

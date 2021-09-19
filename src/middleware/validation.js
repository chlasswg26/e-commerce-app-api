const { validationResult } = require('express-validator')
const helper = require('../helper')
const fs = require('fs')

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

    const file = request.files?.image || {}
    const preview = request.files?.preview || {}

    if (file.length) {
      if (fs.existsSync(`./public/images/${file[0]?.filename}`)) {
        fs.unlinkSync(`./public/images/${file[0]?.filename}`)
      }
    }

    if (preview.length) {
      const files = preview.map(image => {
        return {
          image: image.filename
        }
      })

      files.forEach((file) => {
        if (fs.existsSync(`./public/images/${file.image}`)) {
          fs.unlinkSync(`./public/images/${file.image}`)
        }
      })
    }

    return helper.response(response, 400, {
      message: errors.array()
    })
  }
}

module.exports = validate

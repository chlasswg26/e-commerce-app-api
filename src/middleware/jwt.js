const jwt = require('jsonwebtoken')
const fs = require('fs')
const prisma = require('../config/prisma')
require('dotenv').config()
const {
  NODE_ENV,
  JWT_SECRET_KEY,
  JWT_REFRESH_SECRET_KEY,
  JWT_ALGORITHM
} = process.env
const helper = require('../helper')
const select = {
  id: true,
  name: true,
  email: true,
  image: true,
  phone: true,
  store: true,
  balance: true,
  role: true,
  status: true,
  created_at: true,
  updated_at: true,
  products: true,
  customers: true
}

module.exports = {
  verifyToken: (request, response, next) => {
    try {
      const token = request?.cache?.accessToken
      const verifyOptions = {
        algorithms: JWT_ALGORITHM
      }

      jwt.verify(token, JWT_SECRET_KEY, NODE_ENV === 'production' ? verifyOptions : false, async (err, decoded) => {
        if (err && err.name) {
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
            message: err.message || err
          })
        } else {
          const getUser = await prisma.user.findFirst({
            where: {
              email: decoded?.result?.email
            },
            select
          })

          if (!getUser) {
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
              message: 'Token mismatch'
            })
          }

          request.data = getUser

          next()
        }
      })
    } catch (error) {
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

      return helper.response(response, 500, {
        message: error.message || error
      })
    }
  },
  verifyRefreshToken: (request, response, next) => {
    const token = request?.cache?.accessToken
    const refreshToken = request?.cache?.refreshToken
    const verifyOptions = {
      algorithms: JWT_ALGORITHM
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET_KEY, NODE_ENV === 'production' ? verifyOptions : false, (err, decoded) => {
      if (err && err.name) {
        return helper.response(response, 400, {
          message: err.message || err
        })
      } else {
        const decodedData = jwt.decode(token, {
          json: true
        })

        request.data = decodedData

        next()
      }
    })
  }
}

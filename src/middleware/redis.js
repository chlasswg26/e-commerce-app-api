const redisClient = require('../config/redis')
const helper = require('../helper')
require('dotenv').config()
const {
  ENCRYPTION_SALT,
  ENCRYPTION_PASSWORD,
  ENCRYPTION_DIGEST,
  NODE_ENV
} = process.env
const StringCrypto = require('string-crypto')
const { decryptString } = new StringCrypto({
  salt: ENCRYPTION_SALT,
  iterations: 10,
  digest: ENCRYPTION_DIGEST
})
const fs = require('fs')

module.exports = {
  cacheAuth: (request, response, next) => {
    try {
      const authorization = request.headers.authorization

      if (!authorization) {
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
          message: 'Unauthorized action'
        })
      }

      const encryptionToken = authorization.split(' ')[1]
      const decryptionToken = decryptString(encryptionToken, ENCRYPTION_PASSWORD)
      const redisKey = `auth:${decryptionToken}`

      redisClient.get(redisKey, (error, result) => {
        const cache = JSON.parse(result)

        if (error) {
          if (NODE_ENV === 'development') console.log('redis cache Auth error')

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

        if (!result) {
          if (NODE_ENV === 'development') console.log('redis cache Auth not set, next please')

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

          return next()
        }

        if (NODE_ENV === 'development') console.log('redis cache Auth filled')

        request.cache = cache

        return next()
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
  cacheProduct: (request, response, next) => {
    const redisKey = helper.parse(request.query)

    redisClient.get(`product:${redisKey}`, (error, result) => {
      if (error) {
        if (NODE_ENV === 'development') console.log('redis error', error)

        return helper.response(response, 500, {
          message: error.message || error
        })
      }

      if (result !== null) {
        if (NODE_ENV === 'development') console.log('redis filled')

        const cache = JSON.parse(result)

        return helper.response(response, 200, cache.data, cache.pagination)
      } else {
        if (NODE_ENV === 'development') console.log('redis not set, next please')

        next()
      }
    })
  }
}

const redisClient = require('../config/redis')
const helper = require('../helper')
require('dotenv').config()
const { NODE_ENV } = process.env

module.exports = {
  cacheProduct: (request, response, next) => {
    const redisKey = helper.parse(request.query)

    redisClient.get(`product:${redisKey}`, (error, result) => {
      if (error) {
        helper.imageRemover(request)

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

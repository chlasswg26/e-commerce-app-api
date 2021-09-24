'use strict'

const helper = require('.')
const redisClient = require('../config/redis')
require('dotenv').config()
const { NODE_ENV } = process.env
const Duration = require('duration-js')

module.exports = {
  setCache: async (
    key,
    cached,
    tokenLife,
    response
  ) => {
    const expiringTime = new Duration(tokenLife)

    redisClient.set(key, JSON.stringify(cached), async (err, reply) => {
      if (err) {
        if (NODE_ENV === 'development') console.log('failed to set cache local authentication')

        return helper.response(response, 400, {
          message: err.message || err
        })
      }

      if (reply) {
        if (NODE_ENV === 'development') console.log('redis set cache local authentication', Boolean(reply))

        redisClient.expire(key, expiringTime.seconds(), async (err, reply) => {
          if (err) {
            if (NODE_ENV === 'development') console.log('failed to set expiring time of cache local authentication')

            return helper.response(response, 400, {
              message: err.message || err
            })
          }

          if (NODE_ENV === 'development') console.log('redis set expiring time of cache local authentication', Boolean(reply))
        })
      }
    })
  }
}

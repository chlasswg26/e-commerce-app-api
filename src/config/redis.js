const redis = require('redis')
require('dotenv').config()
const {
  REDIS_PORT,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_TLS,
  REDIS_URL,
  NODE_ENV
} = process.env

let redisOptions = {
  host: REDIS_HOST || '127.0.0.1',
  port: REDIS_PORT || 6379,
  password: REDIS_PASSWORD || undefined,
  tls: NODE_ENV === 'production' ? REDIS_TLS : false
}

if (NODE_ENV === 'production') {
  redisOptions = {
    url: REDIS_URL
  }
}

const redisClient = redis.createClient(redisOptions)

if (NODE_ENV === 'development') {
  redisClient.on('error', (error) => {
    console.log('Something went wrong:', error)
  })
  redisClient.on('connect', () => {
    console.log('Redis client connected')
  })
}

module.exports = redisClient

const helper = require('../helper')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { promisify } = require('util')
const fs = require('fs')
require('dotenv').config()
const {
  ENCRYPTION_PASSWORD,
  ENCRYPTION_SALT,
  ENCRYPTION_DIGEST,
  JWT_SECRET_KEY,
  JWT_TOKEN_LIFE,
  JWT_REFRESH_SECRET_KEY,
  JWT_REFRESH_TOKEN_LIFE,
  JWT_ALGORITHM,
  NODE_ENV
} = process.env
const prisma = require('../config/prisma')
const StringCrypto = require('string-crypto')
const { encryptString } = new StringCrypto({
  salt: ENCRYPTION_SALT,
  iterations: 10,
  digest: ENCRYPTION_DIGEST
})
const redisClient = require('../config/redis')
const redisHelper = require('../helper/redis')
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
  products: {
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      preview: true,
      status: true,
      price: true,
      discount: true,
      category_id: true,
      created_at: true,
      updated_at: true,
      category: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    }
  },
  customers: {
    select: {
      id: true,
      customer_id: true,
      product_id: true,
      price: true,
      quantity: true,
      detail: true,
      status: true,
      created_at: true,
      updated_at: true,
      customer: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  }
}

module.exports = {
  postRegister: (request, response) => {
    const main = async () => {
      try {
        const data = request.body
        const file = request.files?.image || {}

        if (file.length) {
          data.image = file[0]?.filename
        }

        const checkUser = await prisma.user.findFirst({
          where: {
            email: {
              contains: data.email
            }
          },
          select: {
            email: true
          }
        })
        const hashedPassword = bcrypt.hashSync(data.password, 18)

        if (checkUser) {
          if (file.length) {
            if (fs.existsSync(`./public/images/${file[0]?.filename}`)) {
              fs.unlinkSync(`./public/images/${file[0]?.filename}`)
            }
          }

          return helper.response(response, 400, {
            message: 'Account has been registered'
          })
        }

        if (hashedPassword) data.password = hashedPassword

        const result = await prisma.user.create({
          data: data,
          select
        })

        result.products.forEach((file) => {
          file.image = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`
          file.preview.forEach((file) => {
            file.imageUrl = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`

            return file
          })

          return file
        })
        result.customers.forEach((file) => {
          file.customer.image = `${request.protocol}://${request.get('host')}/storage/images/${file.customer.image}`

          return file
        })

        return helper.response(response, 200, result)
      } catch (error) {
        const file = request.files?.image || {}

        if (file.length) {
          if (fs.existsSync(`./public/images/${file[0]?.filename}`)) {
            fs.unlinkSync(`./public/images/${file[0]?.filename}`)
          }
        }

        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Auth Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  postLogin: (request, response) => {
    const main = async () => {
      try {
        const data = request.body
        const checkUser = await prisma.user.findFirst({
          where: {
            email: data.email
          },
          select: {
            ...select,
            password: true
          }
        })

        if (!checkUser?.email) {
          return helper.response(response, 400, {
            message: 'Unregistered account'
          })
        }

        const comparePassword = bcrypt.compareSync(data.password, checkUser?.password)

        delete checkUser?.password

        if (!comparePassword) {
          return helper.response(response, 400, {
            message: 'Incorrect password'
          })
        }

        if (checkUser?.status === 'ACTIVE') {
          return helper.response(response, 400, {
            message: 'Unverified account'
          })
        }

        const get = promisify(redisClient.get).bind(redisClient)

        get(`auth:${checkUser?.email}`)
          .then(async (result) => {
            const cache = JSON.parse(result)

            if (cache && cache?.online === 'ON') {
              return helper.response(response, 400, {
                message: 'Account is online on another device, please sign out first'
              })
            }

            checkUser.image = `${request.protocol}://${request.get('host')}/storage/images/${checkUser?.image}`

            let jwtOption = {}
            const isRemember = data.remember

            switch (NODE_ENV) {
              case 'production':
                jwtOption = {
                  algorithm: JWT_ALGORITHM
                }
                break

              default:
                jwtOption = {
                  expiresIn: JWT_TOKEN_LIFE
                }
                break
            }

            const accessToken = jwt.sign({
              result: {
                email: checkUser?.email
              }
            }, JWT_SECRET_KEY, jwtOption)
            const refreshToken = jwt.sign({
              result: {
                email: checkUser?.email
              }
            }, JWT_REFRESH_SECRET_KEY, jwtOption)
            const cached = {
              online: 'ON',
              remember: data.remember || 'OFF',
              accessToken,
              refreshToken: isRemember === 'ON' ? refreshToken : false
            }
            const encryptionToken = encryptString(checkUser?.email, ENCRYPTION_PASSWORD)
            const redisKey = `auth:${checkUser?.email}`

            checkUser.token = encryptionToken

            await redisHelper.setCache(
              redisKey,
              cached,
              JWT_TOKEN_LIFE,
              response
            )

            checkUser.products.forEach((file) => {
              file.image = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`
              file.preview.forEach((file) => {
                file.imageUrl = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`

                return file
              })

              return file
            })
            checkUser.customers.forEach((file) => {
              file.customer.image = `${request.protocol}://${request.get('host')}/storage/images/${file.customer.image}`

              return file
            })

            return helper.response(response, 200, checkUser)
          })
          .catch((error) => {
            if (NODE_ENV === 'development') console.log('redis error', JSON.parse(error))
          })
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Auth Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  getRefreshToken: async (request, response) => {
    try {
      const data = request.data
      const isRemember = data?.remember
      let jwtOption = {}

      switch (NODE_ENV) {
        case 'production':
          jwtOption = {
            algorithm: JWT_ALGORITHM
          }

          break
        default:
          jwtOption = {
            expiresIn: JWT_REFRESH_TOKEN_LIFE
          }

          break
      }

      const accessToken = jwt.sign({
        result: data?.result
      }, JWT_SECRET_KEY, jwtOption)
      const refreshToken = jwt.sign({
        result: data?.result
      }, JWT_REFRESH_SECRET_KEY, jwtOption)
      const cached = {
        online: 'ON',
        remember: data?.remember || 'OFF',
        accessToken,
        refreshToken: isRemember === 'ON' ? refreshToken : false
      }

      await redisHelper.setCache(
        `auth:${data?.result?.email}`,
        cached,
        JWT_REFRESH_TOKEN_LIFE,
        response
      )

      return helper.response(response, 200, {
        message: 'Refresh token successfully'
      })
    } catch (error) {
      return helper.response(response, 500, {
        message: error.message || error
      })
    }
  },
  getLogout: (request, response) => {
    const main = async () => {
      try {
        const cache = request.cache

        if (cache) {
          const user = jwt.decode(cache?.accessToken, {
            json: true
          })

          redisClient.del(`auth:${user?.result?.email}`, async (err, reply) => {
            if (err) {
              return helper.response(response, 400, {
                message: err.message || err
              })
            }

            if (NODE_ENV === 'development') console.log('redis cleared by prefix key -> auth:*', Boolean(reply))

            return helper.response(response, 200, {
              message: 'Successfully log out'
            })
          })
        } else {
          return helper.response(response, 500, {
            message: 'Session not found, please log in first'
          })
        }
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Auth Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  }
}

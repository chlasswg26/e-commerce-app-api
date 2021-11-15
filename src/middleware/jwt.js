const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')
require('dotenv').config()
const {
  NODE_ENV,
  JWT_SECRET_KEY,
  JWT_REFRESH_SECRET_KEY,
  JWT_ALGORITHM
} = process.env
const helper = require('../helper')
const { decrypt } = require('../helper/crypto-string')
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
  refresh_token: true,
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
  verifyToken: (request, response, next) => {
    try {
      const authorization = request.headers.authorization

      if (!authorization) {
        return helper.response(response, 400, {
          message: 'Unauthorized action'
        })
      }

      const accessToken = authorization.split(' ')[1]
      const getSignedCookie = request.signedCookies?.jwt

      if (!accessToken) {
        helper.imageRemover(request)

        return helper.response(response, 400, {
          message: 'Empty access token'
        })
      }

      if (!getSignedCookie) {
        helper.imageRemover(request)

        return helper.response(response, 400, {
          message: 'Session not found'
        })
      }

      const verifyOptions = {
        algorithms: JWT_ALGORITHM
      }

      jwt.verify(accessToken, JWT_SECRET_KEY, NODE_ENV === 'production' ? verifyOptions : false, async (err, decoded) => {
        if (err && err.name) {
          helper.imageRemover(request)

          return helper.response(response, 400, {
            message: err.message || err
          })
        } else {
          const getUser = await prisma.user.findFirst({
            where: {
              email: decoded?.email
            },
            select
          })

          if (!getUser) {
            helper.imageRemover(request)

            return helper.response(response, 400, {
              message: 'Token mismatch, user not found'
            })
          }

          delete getUser.refresh_token

          request.data = {
            user: getUser
          }

          next()
        }
      })
    } catch (error) {
      helper.imageRemover(request)

      return helper.response(response, 500, {
        message: error.message || error
      })
    }
  },
  verifyRefreshToken: async (request, response, next) => {
    try {
      const getSignedCookie = request.signedCookies?.jwt

      if (!getSignedCookie) {
        return helper.response(response, 400, {
          message: 'Session not found'
        })
      }

      const decryptionSignedCookie = decrypt(13, getSignedCookie, response)
      const verifyOptions = {
        algorithms: JWT_ALGORITHM
      }

      if (!decryptionSignedCookie?.token?.refreshToken) {
        return helper.response(response, 400, {
          message: 'Empty refresh token'
        })
      }

      jwt.verify(decryptionSignedCookie?.token?.refreshToken, JWT_REFRESH_SECRET_KEY, NODE_ENV === 'production' ? verifyOptions : false, async (err, decoded) => {
        if (err && err.name) {
          return helper.response(response, 400, {
            message: err.message || err
          })
        } else {
          const getUser = await prisma.user.findFirst({
            where: {
              email: decoded?.email,
              refresh_token: decryptionSignedCookie?.token?.refreshToken
            },
            select
          })

          if (!getUser) {
            helper.imageRemover(request)

            return helper.response(response, 400, {
              message: 'Token mismatch, user not found'
            })
          }

          request.data = {
            email: decoded?.email,
            remember: decryptionSignedCookie?.token?.remember
          }

          next()
        }
      })
    } catch (error) {
      return helper.response(response, 500, {
        message: error.message || error
      })
    }
  }
}

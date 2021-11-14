const helper = require('../helper')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const fs = require('fs')
const Duration = require('duration-js')
require('dotenv').config()
const {
  JWT_SECRET_KEY,
  JWT_TOKEN_LIFE,
  JWT_REFRESH_SECRET_KEY,
  JWT_REFRESH_TOKEN_LIFE,
  JWT_ALGORITHM,
  NODE_ENV
} = process.env
const prisma = require('../config/prisma')
const { encrypt, decrypt } = require('../helper/crypto-string')
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
            email: data.email
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

        if (!result) {
          return helper.response(response, 400, {
            message: 'Registration failed'
          })
        }

        result.image = `${request.protocol}://${request.get('host')}/storage/images/${data.image}`
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
        helper.imageRemover(request)

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
        const getSignedCookie = request.signedCookies?.jwt
        let getCookieContent = {}

        if (getSignedCookie) {
          getCookieContent = decrypt(13, getSignedCookie || {}, response)
        }

        delete checkUser?.password

        if (!comparePassword) {
          return helper.response(response, 400, {
            message: 'Incorrect password'
          })
        }

        if (checkUser?.status !== 'ACTIVE') {
          return helper.response(response, 400, {
            message: 'Unverified account'
          })
        }

        if (checkUser.refresh_token === getCookieContent?.token?.refreshToken) {
          return helper.response(response, 400, {
            message: 'Account is online on another device, please sign out first'
          })
        }

        checkUser.image = `${request.protocol}://${request.get('host')}/storage/images/${checkUser?.image}`

        const isRemember = data?.remember
        let jwtOption = {}

        if (NODE_ENV === 'production') {
          jwtOption = {
            algorithm: JWT_ALGORITHM
          }
        }

        const dataToSign = {
          email: checkUser.email
        }
        const accessToken = jwt.sign(dataToSign, JWT_SECRET_KEY, {
          ...jwtOption,
          expiresIn: JWT_TOKEN_LIFE
        })
        const refreshToken = jwt.sign(dataToSign, JWT_REFRESH_SECRET_KEY, {
          ...jwtOption,
          expiresIn: JWT_REFRESH_TOKEN_LIFE
        })
        const cookieContent = {
          token: {
            email: checkUser?.email,
            remember: isRemember || 'OFF',
            refreshToken: refreshToken
          }
        }
        const encryptedCookieContent = encrypt(13, cookieContent, response)
        const maxAgeCookie = new Duration(JWT_REFRESH_TOKEN_LIFE)
        const updateRefreshToken = await prisma.user.update({
          where: {
            email: checkUser?.email
          },
          data: {
            refresh_token: refreshToken
          },
          select
        })

        if (!updateRefreshToken) {
          return helper.response(response, 400, {
            message: 'Refresh token invalid, user not found'
          })
        }

        response.cookie('jwt', encryptedCookieContent, {
          maxAge: maxAgeCookie,
          expires: maxAgeCookie + Date.now(),
          httpOnly: true,
          sameSite: 'strict',
          secure: NODE_ENV === 'production',
          signed: true
        })

        checkUser.token = accessToken
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

      if (NODE_ENV === 'production') {
        jwtOption = {
          algorithm: JWT_ALGORITHM
        }
      }

      const getUser = await prisma.user.findFirst({
        where: {
          email: data?.user?.email
        },
        select
      })

      if (!getUser) {
        return helper.response(response, 400, {
          message: 'User not found'
        })
      }

      const dataToSign = {
        email: getUser.email
      }
      const accessToken = jwt.sign(dataToSign, JWT_SECRET_KEY, {
        ...jwtOption,
        expiresIn: JWT_TOKEN_LIFE
      })

      if (isRemember === 'ON') {
        const refreshToken = jwt.sign(dataToSign, JWT_REFRESH_SECRET_KEY, {
          ...jwtOption,
          expiresIn: JWT_REFRESH_TOKEN_LIFE
        })
        const cookieContent = {
          token: {
            email: data?.user?.email,
            remember: 'ON',
            refreshToken: refreshToken
          }
        }
        const encryptedCookieContent = encrypt(13, cookieContent, response)
        const maxAgeCookie = new Duration(JWT_REFRESH_TOKEN_LIFE)
        const updateRefreshToken = await prisma.user.update({
          where: {
            email: data?.user?.email
          },
          data: {
            refresh_token: refreshToken
          },
          select
        })

        if (!updateRefreshToken) {
          return helper.response(response, 400, {
            message: 'Refresh token not updated'
          })
        }

        response.cookie('jwt', encryptedCookieContent, {
          maxAge: maxAgeCookie,
          expires: maxAgeCookie + Date.now(),
          httpOnly: true,
          sameSite: 'strict',
          secure: NODE_ENV === 'production',
          signed: true
        })
      }

      return helper.response(response, 200, {
        token: accessToken
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
        const data = request.data
        const deleteRefreshToken = await prisma.user.update({
          where: {
            email: data?.user?.email
          },
          data: {
            refresh_token: null
          },
          select
        })

        if (!deleteRefreshToken) {
          return helper.response(response, 500, {
            message: 'Refresh token is not deleted'
          })
        }

        response.clearCookie('jwt')

        return helper.response(response, 200, {
          message: 'Successfully log out'
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
  }
}

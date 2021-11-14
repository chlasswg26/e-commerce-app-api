const helper = require('../helper')
const prisma = require('../config/prisma')
require('dotenv').config()
const { NODE_ENV } = process.env

module.exports = {
  admin: (request, response, next) => {
    const main = async () => {
      try {
        const data = request.data.user
        const checkUser = await prisma.user.findFirst({
          where: {
            email: data.email
          },
          select: {
            role: true
          }
        })

        switch (checkUser?.role) {
          case 'ADMIN':
            next()
            break

          default:
            helper.imageRemover(request)

            return helper.response(response, 400, {
              message: 'Access denied, only admin can access this path'
            })
        }
      } catch (error) {
        helper.imageRemover(request)

        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Authorization Middleware: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  seller: (request, response, next) => {
    const main = async () => {
      try {
        const data = request.data.user
        const checkUser = await prisma.user.findFirst({
          where: {
            email: data.email
          },
          select: {
            role: true
          }
        })

        switch (checkUser?.role) {
          case 'ADMIN':
            next()
            break
          case 'SELLER':
            next()
            break

          default:
            helper.imageRemover(request)

            return helper.response(response, 400, {
              message: 'Access denied, only admin & seller can access this path'
            })
        }
      } catch (error) {
        helper.imageRemover(request)

        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Authorization Middleware: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  customer: (request, response, next) => {
    const main = async () => {
      try {
        const data = request.data.user
        const checkUser = await prisma.user.findFirst({
          where: {
            email: data.email
          },
          select: {
            role: true
          }
        })

        switch (checkUser?.role) {
          case 'ADMIN':
            next()
            break
          case 'SELLER':
            next()
            break
          case 'CUSTOMER':
            next()
            break

          default:
            helper.imageRemover(request)

            return helper.response(response, 400, {
              message: 'Access denied, registered user can access this path'
            })
        }
      } catch (error) {
        helper.imageRemover(request)

        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Authorization Middleware: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  }
}

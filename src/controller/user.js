const prisma = require('../config/prisma')
const helper = require('../helper')
const fs = require('fs')
const bcrypt = require('bcrypt')
require('dotenv').config()
const { NODE_ENV } = process.env
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
  getUser: (request, response) => {
    const main = async () => {
      try {
        const filter = request.query
        const getAllUser = await prisma.user.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: filter.search
                }
              },
              {
                email: {
                  contains: filter.search
                }
              }
            ]
          },
          orderBy: filter.orderBy || {
            id: 'asc'
          },
          skip: parseInt((filter.limit || 10) * ((filter.page || 1) - 1)),
          take: parseInt(filter.limit || 10),
          select
        })

        getAllUser.forEach((user) => {
          user.image = `${request.protocol}://${request.get('host')}/storage/images/${user.image}`
          user.products.forEach((file) => {
            file.image = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`
            file.preview.forEach((file) => {
              file.imageUrl = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`

              return file
            })

            return file
          })
          user.customers.forEach((file) => {
            file.customer.image = `${request.protocol}://${request.get('host')}/storage/images/${file.customer.image}`

            return file
          })

          return user
        })

        return helper.response(response, 200, getAllUser)
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('User Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  getUserById: (request, response) => {
    const main = async () => {
      try {
        const parameter = request.params
        const getUserById = await prisma.user.findUnique({
          where: {
            id: parameter.id
          },
          select
        })

        if (!getUserById) {
          helper.response(response, 400, {
            message: 'Bad parameter'
          })
        }

        getUserById.image = `${request.protocol}://${request.get('host')}/storage/images/${getUserById.image}`
        getUserById.products.forEach((file) => {
          file.image = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`
          file.preview.forEach((file) => {
            file.imageUrl = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`

            return file
          })

          return file
        })
        getUserById.customers.forEach((file) => {
          file.customer.image = `${request.protocol}://${request.get('host')}/storage/images/${file.customer.image}`

          return file
        })

        return helper.response(response, 200, getUserById)
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('User Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  postUser: (request, response) => {
    const main = async () => {
      try {
        const data = request.body
        const checkUser = await prisma.user.findFirst({
          where: {
            email: data.email
          },
          select: {
            email: true
          }
        })
        const file = request.files?.image || {}

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

        if (file) {
          data.image = file[0]?.filename
        }

        if (data.password) {
          const hashedPassword = bcrypt.hashSync(data.password, 18)

          data.password = hashedPassword
        }

        const postUser = await prisma.user.create({
          data: data,
          select
        })

        postUser.image = `${request.protocol}://${request.get('host')}/storage/images/${postUser.image}`
        postUser.products.forEach((file) => {
          file.image = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`
          file.preview.forEach((file) => {
            file.imageUrl = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`

            return file
          })

          return file
        })
        postUser.customers.forEach((file) => {
          file.customer.image = `${request.protocol}://${request.get('host')}/storage/images/${file.customer.image}`

          return file
        })

        return helper.response(response, 200, postUser)
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
        if (NODE_ENV === 'development') console.log('User Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  putUser: (request, response) => {
    const main = async () => {
      try {
        const parameter = request.params
        const data = request.body
        const file = request.files?.image || {}
        const checkUser = await prisma.user.findFirst({
          where: {
            OR: [
              {
                [parameter.type || 'id']: parameter.value
              },
              {
                name: data.name
              }
            ]
          },
          select: {
            image: true
          }
        })

        if (!checkUser) {
          if (file.length) {
            if (fs.existsSync(`./public/images/${file[0]?.filename}`)) {
              fs.unlinkSync(`./public/images/${file[0]?.filename}`)
            }
          }

          return helper.response(response, 400, {
            message: 'User not found'
          })
        }

        if (file.length) {
          if (fs.existsSync(`./public/images/${checkUser?.image}`)) {
            fs.unlinkSync(`./public/images/${checkUser?.image}`)
          }

          data.image = file[0]?.filename
        }

        if (data.password) {
          const hashedPassword = bcrypt.hashSync(data.password, 18)

          data.password = hashedPassword
        }

        const putUser = await prisma.user.update({
          where: {
            [parameter.type || 'id']: parameter.value
          },
          data: data,
          select
        })

        if (!putUser) {
          if (file.length) {
            if (fs.existsSync(`./public/images/${file[0]?.filename}`)) {
              fs.unlinkSync(`./public/images/${file[0]?.filename}`)
            }
          }

          return helper.response(response, 400, {
            message: 'User is not updated'
          })
        }

        return helper.response(response, 200, {
          message: 'User is updated'
        })
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
        if (NODE_ENV === 'development') console.log('User Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  deleteUser: (request, response) => {
    const main = async () => {
      try {
        const parameter = request.params
        const checkUser = await prisma.user.findFirst({
          where: {
            [parameter.type || 'id']: parameter.value
          }
        })

        if (checkUser?.image) {
          if (fs.existsSync(`./public/images/${checkUser?.image}`)) {
            fs.unlinkSync(`./public/images/${checkUser?.image}`)
          }
        }

        const deleteUser = await prisma.user.delete({
          where: {
            [parameter.type || 'id']: parameter.value
          }
        })

        if (!deleteUser) {
          return helper.response(response, 400, {
            message: 'User is not deleted'
          })
        }

        return helper.response(response, 200, {
          message: 'User is deleted'
        })
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('User Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  }
}

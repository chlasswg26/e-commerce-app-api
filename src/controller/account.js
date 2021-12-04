const helper = require('../helper')
require('dotenv').config()
const { NODE_ENV } = process.env
const prisma = require('../config/prisma')
const fs = require('fs')
const bcrypt = require('bcrypt')
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
  getProfile: (request, response) => {
    const main = async () => {
      try {
        const data = request.data.user
        const getUser = await prisma.user.findFirst({
          where: {
            email: data?.email
          },
          select
        })

        if (!getUser) {
          return helper.response(response, 400, {
            message: 'User not found'
          })
        }

        getUser.image = `${request.protocol}://${request.get('host')}/storage/images/${getUser?.image}`
        getUser.products.forEach((file) => {
          file.image = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`
          file.preview.forEach((file) => {
            file.imageUrl = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`

            return file
          })

          return file
        })
        getUser.customers.forEach((file) => {
          file.customer.image = `${request.protocol}://${request.get('host')}/storage/images/${file.customer.image}`

          return file
        })

        return helper.response(response, 200, getUser)
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Account Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  updateAccount: (request, response) => {
    const main = async () => {
      try {
        const data = request.body
        const user = request.data.user
        const file = request.files?.image || {}
        const checkUser = await prisma.user.findUnique({
          where: {
            id: user.id
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
            message: 'Account not found'
          })
        }

        if (!data) {
          if (file.length) {
            if (fs.existsSync(`./public/images/${file[0]?.filename}`)) {
              fs.unlinkSync(`./public/images/${file[0]?.filename}`)
            }
          }

          return helper.response(response, 400, {
            message: 'New data is empty'
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

        const updateData = await prisma.user.update({
          where: {
            id: user.id
          },
          data: data,
          select
        })

        if (!updateData) {
          if (file.length) {
            if (fs.existsSync(`./public/images/${file[0]?.filename}`)) {
              fs.unlinkSync(`./public/images/${file[0]?.filename}`)
            }
          }

          return helper.response(response, 400, {
            message: 'Account is not updated'
          })
        }

        return helper.response(response, 200, {
          message: 'Account is updated'
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
        if (NODE_ENV === 'development') console.log('Account Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  }
}

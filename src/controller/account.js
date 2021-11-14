const helper = require('../helper')
require('dotenv').config()
const { NODE_ENV } = process.env
const prisma = require('../config/prisma')
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
  }
}

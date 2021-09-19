const prisma = require('../config/prisma')
const helper = require('../helper')
require('dotenv').config()
const { NODE_ENV } = process.env
const select = {
  id: true,
  name: true,
  description: true,
  status: true,
  created_at: true,
  updated_at: true,
  products: true
}

module.exports = {
  getCategory: (request, response) => {
    const main = async () => {
      try {
        const filter = request.query
        const getAllCategory = await prisma.category.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: filter.search
                }
              },
              {
                description: {
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

        return helper.response(response, 200, getAllCategory)
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Category Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  getCategoryById: (request, response) => {
    const main = async () => {
      try {
        const parameter = request.params
        const getCategoryById = await prisma.category.findUnique({
          where: {
            id: parameter.id
          },
          select
        })

        if (!getCategoryById) {
          return helper.response(response, 400, {
            message: 'Bad parameter'
          })
        }

        return helper.response(response, 200, getCategoryById)
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Category Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  postCategory: (request, response) => {
    const main = async () => {
      try {
        const data = request.body
        const postCategory = await prisma.category.create({
          data: data,
          select
        })

        return helper.response(response, 200, postCategory)
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Category Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  putCategory: (request, response) => {
    const main = async () => {
      try {
        const parameter = request.params
        const data = request.body
        const putCategory = await prisma.category.update({
          where: {
            [parameter.type || 'id']: parameter.value
          },
          data: data,
          select
        })

        if (!putCategory) {
          return helper.response(response, 400, {
            message: 'Category is not updated'
          })
        }

        return helper.response(response, 200, {
          message: 'Category is updated'
        })
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Category Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  deleteCategory: (request, response) => {
    const main = async () => {
      try {
        const parameter = request.params
        const deleteCategory = await prisma.category.delete({
          where: {
            [parameter.type || 'id']: parameter.value
          }
        })

        if (!deleteCategory) {
          return helper.response(response, 400, {
            message: 'Category is not deleted'
          })
        }

        return helper.response(response, 200, {
          message: 'Category is deleted'
        })
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Category Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  }
}

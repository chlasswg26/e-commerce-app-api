const prisma = require('../config/prisma')
const helper = require('../helper')
require('dotenv').config()
const { NODE_ENV } = process.env
const select = {
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
  },
  product: {
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      preview: true,
      status: true,
      price: true,
      discount: true,
      seller_id: true,
      category_id: true,
      created_at: true,
      updated_at: true,
      seller: {
        select: {
          id: true,
          name: true,
          image: true,
          phone: true,
          store: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    }
  }
}

module.exports = {
  getTransaction: (request, response) => {
    const main = async () => {
      try {
        const filter = request.query
        const user = request.data.user
        let where = {
          OR: [
            {
              customer: {
                name: {
                  contains: filter.search
                }
              }
            },
            {
              product: {
                name: {
                  contains: filter.search
                }
              }
            },
            {
              product: {
                description: {
                  contains: filter.search
                }
              }
            },
            {
              product: {
                seller: {
                  name: {
                    contains: filter.search
                  }
                }
              }
            },
            {
              product: {
                seller: {
                  store: {
                    contains: filter.search
                  }
                }
              }
            },
            {
              product: {
                category: {
                  name: {
                    contains: filter.search
                  }
                }
              }
            },
            {
              product: {
                category: {
                  description: {
                    contains: filter.search
                  }
                }
              }
            }
          ]
        }

        if (user?.role !== 'ADMIN') {
          where = {
            ...where,
            AND: {
              customer_id: user?.id
            }
          }
        }

        const getAllTransaction = await prisma.transaction.findMany({
          where,
          orderBy: filter.orderBy || {
            id: 'asc'
          },
          skip: parseInt((filter.limit || 10) * ((filter.page || 1) - 1)),
          take: parseInt(filter.limit || 10),
          select
        })

        getAllTransaction.forEach((transaction) => {
          transaction.customer.image = `${request.protocol}://${request.get('host')}/storage/images/${transaction.customer.image}`
          transaction.product.image = `${request.protocol}://${request.get('host')}/storage/images/${transaction.product.image}`
          transaction.product.preview.forEach((file) => {
            file.imageUrl = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`

            return file
          })
          transaction.product.seller.image = `${request.protocol}://${request.get('host')}/storage/images/${transaction.product.seller.image}`

          return transaction
        })

        const totalTransaction = await prisma.transaction.count({
          where,
          orderBy: filter.orderBy || {
            id: 'asc'
          },
          skip: parseInt((filter.limit || 10) * ((filter.page || 1) - 1)),
          take: parseInt(filter.limit || 10)
        })
        const pagination = {
          total: {
            data: totalTransaction,
            sheet: Math.ceil(totalTransaction / parseInt(filter.limit || 10))
          },
          page: {
            limit: parseInt(filter.limit || 10),
            current: parseInt(filter.page || 1),
            next: ((parseInt(filter.page || 1) + 1) - Math.ceil(totalTransaction / parseInt(filter.limit || 10))) >= 1 ? false : parseInt(filter.page || 1) + 1,
            previous: (parseInt(filter.page || 1) - 1) <= 0 ? false : parseInt(filter.page || 1) - 1
          }
        }

        return helper.response(response, 200, getAllTransaction, pagination)
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Transaction Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  getTransactionById: (request, response) => {
    const main = async () => {
      try {
        const parameter = request.params
        const user = request.data.user
        const getTransactionById = await prisma.transaction.findUnique({
          where: {
            id: parameter.id
          },
          select
        })

        if (user?.id !== getTransactionById?.customer_id) {
          return helper.response(response, 400, {
            message: 'You have no transaction with the same ID\'s'
          })
        }

        if (!getTransactionById) {
          return helper.response(response, 400, {
            message: 'Bad parameter'
          })
        }

        getTransactionById.customer.image = `${request.protocol}://${request.get('host')}/storage/images/${getTransactionById.customer.image}`
        getTransactionById.product.image = `${request.protocol}://${request.get('host')}/storage/images/${getTransactionById.product.image}`
        getTransactionById.product.preview.forEach((file) => {
          file.imageUrl = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`

          return file
        })
        getTransactionById.product.seller.image = `${request.protocol}://${request.get('host')}/storage/images/${getTransactionById.product.seller.image}`

        return helper.response(response, 200, getTransactionById)
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Transaction Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  postTransaction: (request, response) => {
    const main = async () => {
      try {
        const data = request.body
        const user = request.data.user
        const checkProduct = await prisma.product.findFirst({
          where: {
            id: data.product_id
          },
          select: {
            seller_id: true
          }
        })

        if (user?.id === checkProduct.seller_id) {
          return helper.response(response, 400, {
            message: 'You can\'t buy your product by your self'
          })
        }

        const postTransaction = await prisma.transaction.create({
          data: {
            ...data,
            customer_id: user?.id
          },
          select
        })

        postTransaction.customer.image = `${request.protocol}://${request.get('host')}/storage/images/${postTransaction.customer.image}`
        postTransaction.product.image = `${request.protocol}://${request.get('host')}/storage/images/${postTransaction.product.image}`
        postTransaction.product.preview.forEach((file) => {
          file.imageUrl = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`

          return file
        })
        postTransaction.product.seller.image = `${request.protocol}://${request.get('host')}/storage/images/${postTransaction.product.seller.image}`

        return helper.response(response, 200, postTransaction)
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Transaction Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  putTransaction: (request, response) => {
    const main = async () => {
      try {
        const parameter = request.params
        const data = request.body
        const user = request.data.user
        const checkTransaction = await prisma.transaction.findFirst({
          where: {
            [parameter.type || 'id']: parameter.value
          },
          select: {
            product: {
              select: {
                seller_id: true
              }
            }
          }
        })

        if (user?.id !== checkTransaction.product.seller_id) {
          return helper.response(response, 400, {
            message: 'You\'re not the seller of this product'
          })
        }

        const putTransaction = await prisma.transaction.update({
          where: {
            [parameter.type || 'id']: parameter.value
          },
          data: data,
          select
        })

        if (!putTransaction) {
          return helper.response(response, 400, {
            message: 'Transaction is not updated'
          })
        }

        return helper.response(response, 200, {
          message: 'Transaction is updated'
        })
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Transaction Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  deleteTransaction: (request, response) => {
    const main = async () => {
      try {
        const parameter = request.params
        const deleteTransaction = await prisma.transaction.delete({
          where: {
            [parameter.type || 'id']: parameter.value
          }
        })

        if (!deleteTransaction) {
          return helper.response(response, 400, {
            message: 'Transaction is not deleted'
          })
        }

        return helper.response(response, 200, {
          message: 'Transaction is deleted'
        })
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Transaction Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  }
}

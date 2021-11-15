const prisma = require('../config/prisma')
const helper = require('../helper')
const redisHelper = require('../helper/redis')
const fs = require('fs')
require('dotenv').config()
const { NODE_ENV } = process.env
const select = {
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

module.exports = {
  getProduct: (request, response) => {
    const main = async () => {
      try {
        const filter = request.query
        const getAllProduct = await prisma.product.findMany({
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

        getAllProduct.forEach(product => {
          product.image = `${request.protocol}://${request.get('host')}/storage/images/${product.image}`
          product.preview.forEach((file) => {
            file.imageUrl = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`

            return file
          })
          product.seller.image = `${request.protocol}://${request.get('host')}/storage/images/${product.seller.image}`

          return product
        })

        const totalProduct = await prisma.product.count({
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
          take: parseInt(filter.limit || 10)
        })
        const pagination = {
          total: {
            data: totalProduct,
            sheet: Math.ceil(totalProduct / parseInt(filter.limit || 10))
          },
          page: {
            limit: parseInt(filter.limit || 10),
            current: parseInt(filter.page || 1),
            next: ((parseInt(filter.page || 1) + 1) - Math.ceil(totalProduct / parseInt(filter.limit || 10))) >= 1 ? false : parseInt(filter.page || 1) + 1,
            previous: (parseInt(filter.page || 1) - 1) <= 0 ? false : parseInt(filter.page || 1) - 1
          }
        }
        const {
          redisKey,
          cached,
          tokenLife
        } = {
          redisKey: `product:${helper.parse(request.query)}`,
          cached: {
            data: getAllProduct,
            pagination: pagination
          },
          tokenLife: '1m'
        }

        await redisHelper.setCache(
          redisKey,
          cached,
          tokenLife,
          response
        )

        return helper.response(response, 200, getAllProduct, pagination)
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Product Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  getProductById: (request, response) => {
    const main = async () => {
      try {
        const parameter = request.params
        const getProductById = await prisma.product.findUnique({
          where: {
            id: parameter.id
          },
          select
        })

        if (!getProductById) {
          helper.response(response, 400, {
            message: 'Bad parameter'
          })
        }

        getProductById.image = `${request.protocol}://${request.get('host')}/storage/images/${getProductById.image}`
        getProductById.preview.forEach((file) => {
          file.imageUrl = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`

          return file
        })
        getProductById.seller.image = `${request.protocol}://${request.get('host')}/storage/images/${getProductById.seller.image}`

        return helper.response(response, 200, getProductById)
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Product Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  postProduct: (request, response) => {
    const main = async () => {
      try {
        const data = request.body
        const user = request.data.user
        const file = request.files?.image || {}
        const preview = request.files?.preview || {}

        if (file.length) data.image = file[0]?.filename

        if (preview.length) {
          const files = preview.map(image => {
            return {
              image: image.filename
            }
          })

          data.preview = files
        }

        const postProduct = await prisma.product.create({
          data: {
            ...data,
            seller_id: user?.id
          },
          select
        })

        postProduct.image = `${request.protocol}://${request.get('host')}/storage/images/${postProduct.image}`
        postProduct.preview.forEach((file) => {
          file.imageUrl = `${request.protocol}://${request.get('host')}/storage/images/${file.image}`

          return file
        })
        postProduct.seller.image = `${request.protocol}://${request.get('host')}/storage/images/${postProduct.seller.image}`

        return helper.response(response, 200, postProduct)
      } catch (error) {
        const file = request.files?.image || {}
        const preview = request.files?.preview || {}

        if (file.length) {
          if (fs.existsSync(`./public/images/${file[0]?.filename}`)) {
            fs.unlinkSync(`./public/images/${file[0]?.filename}`)
          }
        }

        if (preview.length) {
          const files = preview.map(image => {
            return {
              image: image.filename
            }
          })

          files.forEach((file) => {
            if (fs.existsSync(`./public/images/${file.image}`)) {
              fs.unlinkSync(`./public/images/${file.image}`)
            }
          })
        }

        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Product Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  putProduct: (request, response) => {
    const main = async () => {
      try {
        const parameter = request.params
        const data = request.body
        const user = request.data.user
        const file = request.files?.image || {}
        const preview = request.files?.preview || {}
        const checkProduct = await prisma.product.findFirst({
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
            seller_id: true,
            image: true,
            preview: true
          }
        })

        if (user?.id !== checkProduct.seller_id) {
          return helper.response(response, 400, {
            message: 'You\'re not the seller of this product'
          })
        }

        if (!checkProduct) {
          if (file.length) {
            if (fs.existsSync(`./public/images/${file[0]?.filename}`)) {
              fs.unlinkSync(`./public/images/${file[0]?.filename}`)
            }
          }

          if (preview.length) {
            const files = preview.map(image => {
              return {
                image: image.filename
              }
            })

            files.forEach((file) => {
              if (fs.existsSync(`./public/images/${file.image}`)) {
                fs.unlinkSync(`./public/images/${file.image}`)
              }
            })
          }

          return helper.response(response, 400, {
            message: 'Product not found'
          })
        }

        if (file.length) {
          if (fs.existsSync(`./public/images/${checkProduct.image}`)) {
            fs.unlinkSync(`./public/images/${checkProduct.image}`)
          }

          data.image = file[0]?.filename
        }

        if (preview.length) {
          checkProduct.preview.forEach((preview) => {
            if (fs.existsSync(`./public/images/${preview.image}`)) {
              fs.unlinkSync(`./public/images/${preview.image}`)
            }
          })

          const files = preview.map(image => {
            return {
              image: image.filename
            }
          })

          data.preview = files
        }

        const putProduct = await prisma.product.update({
          where: {
            [parameter.type || 'id']: parameter.value
          },
          data: data,
          select
        })

        if (!putProduct) {
          if (file.length) {
            if (fs.existsSync(`./public/images/${file[0]?.filename}`)) {
              fs.unlinkSync(`./public/images/${file[0]?.filename}`)
            }
          }

          if (preview.length) {
            const files = preview.map(image => {
              return {
                image: image.filename
              }
            })

            files.forEach((file) => {
              if (fs.existsSync(`./public/images/${file.image}`)) {
                fs.unlinkSync(`./public/images/${file.image}`)
              }
            })
          }

          return helper.response(response, 400, {
            message: 'Product is not updated'
          })
        }

        return helper.response(response, 200, {
          message: 'Product is updated'
        })
      } catch (error) {
        const file = request.files?.image || {}
        const preview = request.files?.preview || {}

        if (file.length) {
          if (fs.existsSync(`./public/images/${file[0]?.filename}`)) {
            fs.unlinkSync(`./public/images/${file[0]?.filename}`)
          }
        }

        if (preview.length) {
          const files = preview.map(image => {
            return {
              image: image.filename
            }
          })

          files.forEach((file) => {
            if (fs.existsSync(`./public/images/${file.image}`)) {
              fs.unlinkSync(`./public/images/${file.image}`)
            }
          })
        }

        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Product Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  deleteProduct: (request, response) => {
    const main = async () => {
      try {
        const parameter = request.params
        const checkProduct = await prisma.product.findFirst({
          where: {
            [parameter.type || 'id']: parameter.value
          }
        })

        if (checkProduct.image) {
          if (fs.existsSync(`./public/images/${checkProduct.image}`)) {
            fs.unlinkSync(`./public/images/${checkProduct.image}`)
          }
        }

        if (checkProduct.preview.length) {
          checkProduct.preview.forEach((preview) => {
            if (fs.existsSync(`./public/images/${preview.image}`)) {
              fs.unlinkSync(`./public/images/${preview.image}`)
            }
          })
        }

        const deleteProduct = await prisma.product.delete({
          where: {
            [parameter.type || 'id']: parameter.value
          }
        })

        if (!deleteProduct) {
          return helper.response(response, 400, {
            message: 'Product is not deleted'
          })
        }

        return helper.response(response, 200, {
          message: 'Product is deleted'
        })
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Product Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  }
}

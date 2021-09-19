const prisma = require('../config/prisma')
const helper = require('../helper')
const fs = require('fs')
require('dotenv').config()
const { NODE_ENV } = process.env
const select = {
  id: true,
  name: true,
  description: true,
  uri: true,
  image: true,
  status: true,
  created_at: true,
  updated_at: true
}

module.exports = {
  getBanner: (request, response) => {
    const main = async () => {
      try {
        const filter = request.query
        const getAllBanner = await prisma.banner.findMany({
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

        getAllBanner.forEach(banner => {
          banner.image = `${request.protocol}://${request.get('host')}/storage/images/${banner.image}`

          return banner
        })

        return helper.response(response, 200, getAllBanner)
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Banner Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  getBannerById: (request, response) => {
    const main = async () => {
      try {
        const parameter = request.params
        const getBannerById = await prisma.banner.findUnique({
          where: {
            id: parameter.id
          },
          select
        })

        if (!getBannerById) {
          helper.response(response, 400, {
            message: 'Bad parameter'
          })
        }

        getBannerById.image = `${request.protocol}://${request.get('host')}/storage/images/${getBannerById.image}`

        return helper.response(response, 200, getBannerById)
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Banner Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  postBanner: (request, response) => {
    const main = async () => {
      try {
        const data = request.body
        const file = request.files?.image || {}

        if (file.length) data.image = file[0]?.filename

        const postBanner = await prisma.banner.create({
          data: data,
          select
        })

        postBanner.image = `${request.protocol}://${request.get('host')}/storage/images/${postBanner.image}`

        return helper.response(response, 200, postBanner)
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
        if (NODE_ENV === 'development') console.log('Banner Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  putBanner: (request, response) => {
    const main = async () => {
      try {
        const parameter = request.params
        const data = request.body
        const file = request.files?.image || {}
        const checkBanner = await prisma.banner.findFirst({
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

        if (!checkBanner) {
          if (file.length) {
            if (fs.existsSync(`./public/images/${file[0]?.filename}`)) {
              fs.unlinkSync(`./public/images/${file[0]?.filename}`)
            }
          }

          return helper.response(response, 400, {
            message: 'Banner not found'
          })
        }

        if (file.length) {
          if (fs.existsSync(`./public/images/${checkBanner.image}`)) {
            fs.unlinkSync(`./public/images/${checkBanner.image}`)
          }

          data.image = file[0]?.filename
        }

        const putBanner = await prisma.banner.update({
          where: {
            [parameter.type || 'id']: parameter.value
          },
          data: data,
          select
        })

        if (!putBanner) {
          if (file.length) {
            if (fs.existsSync(`./public/images/${file[0]?.filename}`)) {
              fs.unlinkSync(`./public/images/${file[0]?.filename}`)
            }
          }

          return helper.response(response, 400, {
            message: 'Banner is not updated'
          })
        }

        return helper.response(response, 200, {
          message: 'Banner is updated'
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
        if (NODE_ENV === 'development') console.log('Banner Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  },
  deleteBanner: (request, response) => {
    const main = async () => {
      try {
        const parameter = request.params
        const checkBanner = await prisma.banner.findFirst({
          where: {
            [parameter.type || 'id']: parameter.value
          }
        })

        if (checkBanner.image) {
          if (fs.existsSync(`./public/images/${checkBanner.image}`)) {
            fs.unlinkSync(`./public/images/${checkBanner.image}`)
          }
        }

        const deleteBanner = await prisma.banner.delete({
          where: {
            [parameter.type || 'id']: parameter.value
          }
        })

        if (!deleteBanner) {
          return helper.response(response, 400, {
            message: 'Banner is not deleted'
          })
        }

        return helper.response(response, 200, {
          message: 'Banner is deleted'
        })
      } catch (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      }
    }

    main()
      .finally(async () => {
        if (NODE_ENV === 'development') console.log('Banner Controller: Ends the Query Engine child process and closes all connections')

        await prisma.$disconnect()
      })
  }
}

/* eslint-disable no-useless-escape */
/* eslint-disable node/no-callback-literal */
/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const helper = require('../helper')
require('dotenv').config()
const { MAX_FILE_SIZE } = process.env

const multerStorage = multer({
  storage: multer.diskStorage({
    destination: (request, file, callback) => {
      callback(null, './public/images'), file
    },
    filename: (request, file, callback) => {
      const fileExtension = file.originalname.split('.')[1]
      const customFileName = `${new Date().toISOString().replace(/[-T:\.Z]/g, '')}-${crypto.randomBytes(18).toString('hex')}.${fileExtension}`
      callback(null, customFileName)
    }
  }),
  fileFilter: (request, file, callback) => {
    const filetypes = /jpg|jpeg|png|svg|gif/
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    )
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && extname) {
      callback(null, true)
    } else {
      callback('Filetype not allowed!', false)
    }
  },
  limits: {
    fileSize: MAX_FILE_SIZE * 1024 * 1024
  }
})

module.exports = {
  multerHandler: (request, response, next) => {
    const upload = multerStorage.fields([
      {
        name: 'image',
        maxCount: 1
      },
      {
        name: 'preview',
        maxCount: 10
      }
    ])

    upload(request, response, (error) => {
      if (error instanceof multer.MulterError) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      } else if (error) {
        return helper.response(response, 500, {
          message: error.message || error
        })
      } else {
        return next()
      }
    })
  }
}

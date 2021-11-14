'use strict'

const mailer = require('nodemailer')
const fs = require('fs')
require('dotenv').config()
const {
  SERVICE_EMAIL,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  NODE_ENV
} = process.env

module.exports = {
  parse: (object) => {
    return Object.keys(object)
      .map(key => key + object[key])
      .join('')
  },
  nodemailer: async (email, subject, template) => {
    const createTestAccount = await mailer.createTestAccount()
    const transporter = mailer.createTransport({
      host: NODE_ENV === 'development' ? 'smtp.ethereal.email' : SMTP_HOST,
      port: NODE_ENV === 'development' ? 587 : SMTP_PORT,
      secure: NODE_ENV === 'production',
      auth: {
        user: NODE_ENV === 'development' ? createTestAccount.user : SMTP_USERNAME,
        pass: NODE_ENV === 'development' ? createTestAccount.pass : SMTP_PASSWORD
      }
    })
    const mailing = await transporter.sendMail({
      from: SERVICE_EMAIL || 'support@demo.com',
      to: email || 'support@demo.com',
      subject: subject || 'Untitled',
      html: template
    })
    let previewUrl = 'Verification link sent to your email'

    if (NODE_ENV === 'development') {
      previewUrl = mailer.getTestMessageUrl(mailing)

      console.log('Message sent: %s', mailing.messageId)
      console.log('Preview URL: %s', previewUrl)
    }

    return previewUrl
  },
  random: (length) => {
    let result = ''

    const characters = '012345678'
    const charactersLength = characters.length

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }

    return result
  },
  response: (
    response,
    status,
    data,
    pagination
  ) => {
    const result = {}
    result.status = status || 200
    result.data = data

    if (pagination) result.pagination = pagination

    return response.status(result.status).json(result)
  },
  imageRemover: (request) => {
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
  }
}

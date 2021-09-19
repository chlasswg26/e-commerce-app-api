'use strict'

const mailer = require('nodemailer')
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
  join: (object) => {
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
  }
}
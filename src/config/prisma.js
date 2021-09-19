const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
require('dotenv').config()
const { NODE_ENV } = process.env

prisma.$on('beforeExit', () => {
  if (NODE_ENV === 'development') console.log('Shutting down server')
})

module.exports = prisma

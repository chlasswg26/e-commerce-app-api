const express = require('express')
const Route = express.Router()

const authRoutes = require('./route/auth')
const bannerRoutes = require('./route/banner')
const categoryRoutes = require('./route/category')
const productRoutes = require('./route/product')
const transactionRoutes = require('./route/transaction')
const userRoutes = require('./route/user')
const accountRoutes = require('./route/account')

Route
  .use('/auth', authRoutes)
  .use('/banner', bannerRoutes)
  .use('/category', categoryRoutes)
  .use('/product', productRoutes)
  .use('/transaction', transactionRoutes)
  .use('/user', userRoutes)
  .use('/account', accountRoutes)

module.exports = Route

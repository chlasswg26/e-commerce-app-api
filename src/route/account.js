const express = require('express')
const Route = express.Router()
const { getProfile, updateAccount } = require('../controller/account')
const { verifyToken } = require('../middleware/jwt')
const { multerHandler } = require('../middleware/multer')

Route
  .get('/profile', verifyToken, getProfile)
  .put('/update', multerHandler, verifyToken, updateAccount)

module.exports = Route

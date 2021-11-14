const express = require('express')
const Route = express.Router()
const { getProfile } = require('../controller/account')
const { verifyToken } = require('../middleware/jwt')

Route
  .get('/profile', verifyToken, getProfile)

module.exports = Route

const express = require('express')
const Route = express.Router()
const {
  postRegister,
  postLogin,
  getRefreshToken,
  getLogout
} = require('../controller/auth')
const { verifyRefreshToken, verifyToken } = require('../middleware/jwt')
const { multerHandler } = require('../middleware/multer')
const validate = require('../middleware/validation')
const { check } = require('express-validator')

Route
  .post('/register', multerHandler, validate([
    check('name').escape().trim().default('anonymous'),
    check('email').escape().trim().notEmpty().withMessage('E-mail Can\'t be empty').bail().isEmail().withMessage('E-mail bad format'),
    check('password').escape().trim().notEmpty().withMessage('Password Can\'t be empty').bail().isLength({
      min: 8
    }).withMessage('Password too short, min 8 character')
  ]), postRegister)
  .post('/login', validate([
    check('email').escape().trim().notEmpty().withMessage('E-mail Can\'t be empty').bail().isEmail().withMessage('E-mail bad format'),
    check('password').escape().trim().notEmpty().withMessage('Password Can\'t be empty').bail().isLength({
      min: 8
    }).withMessage('Password too short, min 8 character')
  ]), postLogin)
  .get('/refresh-token', verifyRefreshToken, getRefreshToken)
  .delete('/logout', verifyToken, getLogout)

module.exports = Route

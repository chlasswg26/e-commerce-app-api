const express = require('express')
const { query, param, check } = require('express-validator')
const Route = express.Router()
const {
  getUser,
  getUserById,
  postUser,
  putUser,
  deleteUser
} = require('../controller/user')
const { verifyToken } = require('../middleware/jwt')
const { multerHandler } = require('../middleware/multer')
const validate = require('../middleware/validation')
const { admin } = require('../middleware/authorization')

Route
  .get('/', validate([
    query('search').escape().trim(),
    query('limit').escape().trim().toInt(),
    query('page').escape().trim().toInt()
  ]), verifyToken, admin, getUser)
  .get('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('User ID can\'t be empty').bail().isNumeric().withMessage('User ID must be numeric').bail().toInt()
  ]), verifyToken, admin, getUserById)
  .post('/', multerHandler, validate([
    check('name').escape().trim().notEmpty().withMessage('User name can\'t be empty'),
    check('email').escape().trim().notEmpty().withMessage('E-mail address can\'t be empty').bail().isEmail().withMessage('E-mail bad format'),
    check('password').escape().trim().notEmpty().withMessage('Password can\'t be empty').bail().isLength({
      min: 8
    }).withMessage('Password too short, min 8 character'),
    check('phone').escape().trim(),
    check('store').escape().trim()
  ]), verifyToken, admin, postUser)
  .put('/:value', multerHandler, validate([
    param('value').escape().trim().notEmpty().withMessage('User parameter value can\'t be empty').bail().isNumeric().withMessage('User parameter value must be numeric').bail().toInt()
  ]), verifyToken, admin, putUser)
  .put('/:type/:value', multerHandler, validate([
    param('value').escape().trim().notEmpty().withMessage('User parameter value can\'t be empty')
  ]), verifyToken, admin, putUser)
  .delete('/:value', validate([
    param('value').escape().trim().notEmpty().withMessage('User parameter value can\'t be empty').bail().isNumeric().withMessage('User parameter value must be numeric').bail().toInt()
  ]), verifyToken, admin, deleteUser)
  .delete('/:type/:value', validate([
    param('value').escape().trim().notEmpty().withMessage('User parameter value can\'t be empty')
  ]), verifyToken, admin, deleteUser)

module.exports = Route

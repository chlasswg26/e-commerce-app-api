const express = require('express')
const { query, param, check } = require('express-validator')
const Route = express.Router()
const {
  getCategory,
  getCategoryById,
  postCategory,
  putCategory,
  deleteCategory
} = require('../controller/category')
const { admin } = require('../middleware/authorization')
const { verifyToken } = require('../middleware/jwt')
const validate = require('../middleware/validation')

Route
  .get('/', validate([
    query('search').escape().trim(),
    query('limit').escape().trim().toInt(),
    query('page').escape().trim().toInt()
  ]), getCategory)
  .get('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('Category ID can\'t be empty').bail().isNumeric().withMessage('Category ID must be numeric').bail().toInt()
  ]), getCategoryById)
  .post('/', validate([
    check('name').escape().trim().notEmpty().withMessage('Category name can\'t be empty'),
    check('description').escape().trim()
  ]), verifyToken, admin, postCategory)
  .put('/:value', validate([
    param('value').escape().trim().notEmpty().withMessage('Category parameter value can\'t be empty').bail().isNumeric().withMessage('Category parameter value must be numeric').bail().toInt(),
    check('name').escape().trim().notEmpty().withMessage('Category name can\'t be empty'),
    check('description').escape().trim()
  ]), verifyToken, admin, putCategory)
  .put('/:type/:value', validate([
    param('value').escape().trim().notEmpty().withMessage('Category parameter value can\'t be empty'),
    check('name').escape().trim().notEmpty().withMessage('Category name can\'t be empty'),
    check('description').escape().trim()
  ]), verifyToken, admin, putCategory)
  .delete('/:value', validate([
    param('value').escape().trim().notEmpty().withMessage('Category parameter value can\'t be empty').bail().isNumeric().withMessage('Category parameter value must be numeric').bail().toInt()
  ]), verifyToken, admin, deleteCategory)
  .delete('/:type/:value', validate([
    param('value').escape().trim().notEmpty().withMessage('Category parameter value can\'t be empty')
  ]), verifyToken, admin, deleteCategory)

module.exports = Route

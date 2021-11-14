const express = require('express')
const { query, param, check } = require('express-validator')
const Route = express.Router()
const {
  getProduct,
  getProductById,
  postProduct,
  putProduct,
  deleteProduct
} = require('../controller/product')
const { verifyToken } = require('../middleware/jwt')
const { cacheProduct } = require('../middleware/redis')
const { multerHandler } = require('../middleware/multer')
const validate = require('../middleware/validation')
const { seller } = require('../middleware/authorization')

Route
  .get('/', validate([
    query('search').escape().trim(),
    query('limit').escape().trim().toInt(),
    query('page').escape().trim().toInt()
  ]), cacheProduct, getProduct)
  .get('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('Product ID can\'t be empty').bail().isNumeric().withMessage('Product ID must be numeric').bail().toInt()
  ]), getProductById)
  .post('/', multerHandler, validate([
    check('name').escape().trim().notEmpty().withMessage('Product name can\'t be empty'),
    check('description').escape().trim(),
    check('price').escape().trim().isNumeric().withMessage('Price can\'t be empty').bail().toFloat(),
    check('category_id').escape().trim().notEmpty().withMessage('Category ID\'s can\'t be empty').bail().isNumeric().withMessage('Category ID\'s must be numeric').bail().toInt()
  ]), verifyToken, seller, postProduct)
  .put('/:value', multerHandler, validate([
    param('value').escape().trim().notEmpty().withMessage('Product parameter value can\'t be empty').bail().isNumeric().withMessage('Product parameter value must be numeric').bail().toInt(),
    check('name').escape().trim().notEmpty().withMessage('Product name can\'t be empty'),
    check('description').escape().trim(),
    check('price').escape().trim().isNumeric().withMessage('Price can\'t be empty').bail().toFloat(),
    check('category_id').escape().trim().notEmpty().withMessage('Category ID\'s can\'t be empty').bail().isNumeric().withMessage('Category ID\'s must be numeric').bail().toInt()
  ]), verifyToken, seller, putProduct)
  .put('/:type/:value', multerHandler, validate([
    param('value').escape().trim().notEmpty().withMessage('Product parameter value can\'t be empty'),
    check('name').escape().trim().notEmpty().withMessage('Product name can\'t be empty'),
    check('description').escape().trim(),
    check('price').escape().trim().isNumeric().withMessage('Price can\'t be empty').bail().toFloat(),
    check('category_id').escape().trim().notEmpty().withMessage('Category ID\'s can\'t be empty').bail().isNumeric().withMessage('Category ID\'s must be numeric').bail().toInt()
  ]), verifyToken, seller, putProduct)
  .delete('/:value', validate([
    param('value').escape().trim().notEmpty().withMessage('Product parameter value can\'t be empty').bail().isNumeric().withMessage('Product parameter value must be numeric').bail().toInt()
  ]), verifyToken, seller, deleteProduct)
  .delete('/:type/:value', validate([
    param('value').escape().trim().notEmpty().withMessage('Product parameter value can\'t be empty')
  ]), verifyToken, seller, deleteProduct)

module.exports = Route

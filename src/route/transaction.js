const express = require('express')
const { query, param, check } = require('express-validator')
const Route = express.Router()
const {
  getTransaction,
  getTransactionById,
  postTransaction,
  putTransaction
} = require('../controller/transaction')
const { customer, seller } = require('../middleware/authorization')
const { verifyToken } = require('../middleware/jwt')
const validate = require('../middleware/validation')

Route
  .get('/', validate([
    query('search').escape().trim(),
    query('limit').escape().trim().toInt(),
    query('page').escape().trim().toInt()
  ]), verifyToken, customer, getTransaction)
  .get('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('Transaction ID can\'t be empty').bail().isNumeric().withMessage('Transaction ID must be numeric').bail().toInt()
  ]), verifyToken, customer, getTransactionById)
  .post('/', validate([
    check('product_id').escape().trim().notEmpty().withMessage('Product ID\'s can\'t be empty').bail().isNumeric().withMessage('Product ID\'s must be numeric').bail().toInt(),
    check('price').escape().trim().notEmpty().withMessage('Price can\'t be empty').bail().isNumeric().withMessage('Price must be numeric').bail().toFloat(),
    check('quantity').escape().trim().notEmpty().withMessage('Transaction quantity can\'t be empty').bail().isNumeric().withMessage('Transaction quantity must be numeric').bail().isLength({
      min: 1
    }).withMessage('Transaction quantity cannot reduce below 1').toInt()
  ]), verifyToken, customer, postTransaction)
  .put('/:value', validate([
    param('value').escape().trim().notEmpty().withMessage('Transaction parameter value can\'t be empty').bail().isNumeric().withMessage('Transaction parameter value must be numeric').bail().toInt()
  ]), verifyToken, seller, putTransaction)
  .put('/:type/:value', validate([
    param('value').escape().trim().notEmpty().withMessage('Transaction parameter value can\'t be empty')
  ]), verifyToken, seller, putTransaction)

module.exports = Route

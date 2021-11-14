const express = require('express')
const { query, param, check } = require('express-validator')
const Route = express.Router()
const {
  getBanner,
  getBannerById,
  postBanner,
  putBanner,
  deleteBanner
} = require('../controller/banner')
const { verifyToken } = require('../middleware/jwt')
const { multerHandler } = require('../middleware/multer')
const validate = require('../middleware/validation')
const { admin } = require('../middleware/authorization')

Route
  .get('/', validate([
    query('search').escape().trim(),
    query('limit').escape().trim().toInt(),
    query('page').escape().trim().toInt()
  ]), getBanner)
  .get('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('Banner ID can\'t be empty').bail().isNumeric().withMessage('Banner ID must be numeric').bail().toInt()
  ]), getBannerById)
  .post('/', multerHandler, validate([
    check('name').escape().trim().notEmpty().withMessage('Banner name can\'t be empty'),
    check('description').escape().trim(),
    check('uri').escape().trim()
  ]), verifyToken, admin, postBanner)
  .put('/:value', multerHandler, validate([
    param('value').escape().trim().notEmpty().withMessage('Banner parameter value can\'t be empty').bail().isNumeric().withMessage('Banner parameter value must be numeric').bail().toInt(),
    check('name').escape().trim().notEmpty().withMessage('Banner name can\'t be empty'),
    check('description').escape().trim(),
    check('uri').escape().trim()
  ]), verifyToken, admin, putBanner)
  .put('/:type/:value', multerHandler, validate([
    param('value').escape().trim().notEmpty().withMessage('Banner parameter value can\'t be empty'),
    check('name').escape().trim().notEmpty().withMessage('Banner name can\'t be empty'),
    check('description').escape().trim(),
    check('uri').escape().trim()
  ]), verifyToken, admin, putBanner)
  .delete('/:value', validate([
    param('value').escape().trim().notEmpty().withMessage('Banner parameter value can\'t be empty').bail().isNumeric().withMessage('Banner parameter value must be numeric').bail().toInt()
  ]), verifyToken, admin, deleteBanner)
  .delete('/:type/:value', validate([
    param('value').escape().trim().notEmpty().withMessage('Banner parameter value can\'t be empty')
  ]), verifyToken, admin, deleteBanner)

module.exports = Route

const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const app = express()
require('dotenv').config()
const {
  PORT,
  HOST,
  NODE_ENV,
  FRONTEND_URL,
  COOKIE_SECRET_KEY
} = process.env
const routeNavigator = require('./src/index')
const favicon = require('serve-favicon')
const fs = require('fs')
const expressJSDocSwagger = require('express-jsdoc-swagger')
const swaggerJSON = require('./swagger.json')

if (!fs.existsSync('./public/images')) {
  fs.mkdirSync('./public/images', {
    recursive: true
  })
}

expressJSDocSwagger(app)({
  info: {
    version: '1.0.0',
    title: 'E-commerce',
    license: {
      name: 'MIT'
    }
  },
  baseDir: __dirname,
  swaggerUIPath: '/v1/documentation',
  exposeSwaggerUI: true,
  exposeApiDocs: true,
  apiDocsPath: '/v1/documentation.json',
  notRequiredAsNullable: true,
  swaggerUiOptions: {}
}, swaggerJSON)

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])
app.use(helmet())
app.use(cookieParser(COOKIE_SECRET_KEY))
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use('/storage', express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ strict: true }))
app.use(cors({
  origin: NODE_ENV === 'development' ? '*' : FRONTEND_URL,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  credentials: NODE_ENV === 'production'
}))
app.use(morgan('dev'))
app.use('/api/v1', routeNavigator)

app.listen(PORT, HOST, () => {
  if (NODE_ENV === 'development') console.log(`Listen port at ${PORT}`)
})

module.exports = app

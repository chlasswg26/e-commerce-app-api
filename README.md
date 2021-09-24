# Welcome to E-Commerce RESTful APIs 👋
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://documenter.getpostman.com/view/11433882/UUxtDpyx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://choosealicense.com/licenses/mit/)

> Simplified backend for e-commerce apps

### 🏠 [Homepage](https://github.com/chlasswg26/e-commerce-app-api#readme)

### ✨ [Demo](https://blanja-api.up.railway.app/v1/documentation)


## Features

- CRUD
- ORM DATABASE
- AUTHENTICATION
- AUTHORIZATION
- JWT TOKEN
- FILE UPLOAD
- SANITIZER
- VALIDATOR
- CACHE
- MORE

## Dependencies

- [@prisma/client](https://ghub.io/@prisma/client): Prisma Client is an auto-generated, type-safe and modern JavaScript/TypeScript ORM for Node.js that&#39;s tailored to your data. Supports MySQL, PostgreSQL, MariaDB, SQLite databases.
- [bcrypt](https://ghub.io/bcrypt): A bcrypt library for NodeJS.
- [cors](https://ghub.io/cors): Node.js CORS middleware
- [cross-env](https://ghub.io/cross-env): Run scripts that set and use environment variables across platforms
- [dotenv](https://ghub.io/dotenv): Loads environment variables from .env file
- [duration-js](https://ghub.io/duration-js): small simple library for dealing with durations
- [express](https://ghub.io/express): Fast, unopinionated, minimalist web framework
- [express-jsdoc-swagger](https://ghub.io/express-jsdoc-swagger): Swagger OpenAPI 3.x generator
- [express-validator](https://ghub.io/express-validator): Express middleware for the validator module.
- [helmet](https://ghub.io/helmet): help secure Express/Connect apps with various HTTP headers
- [jsonwebtoken](https://ghub.io/jsonwebtoken): JSON Web Token implementation (symmetric and asymmetric)
- [md5](https://ghub.io/md5): js function for hashing messages with MD5
- [morgan](https://ghub.io/morgan): HTTP request logger middleware for node.js
- [multer](https://ghub.io/multer): Middleware for handling `multipart/form-data`.
- [nodemailer](https://ghub.io/nodemailer): Easy as cake e-mail sending from your Node.js applications
- [prisma](https://ghub.io/prisma): Prisma is an open-source database toolkit. It includes a JavaScript/TypeScript ORM for Node.js, migrations and a modern GUI to view and edit the data in your database. You can use Prisma in new projects or add it to an existing one.
- [prisma-dbml-generator](https://ghub.io/prisma-dbml-generator): Prisma DBML Generator
- [redis](https://ghub.io/redis): A high performance Redis client.
- [serve-favicon](https://ghub.io/serve-favicon): favicon serving middleware with caching
- [string-crypto](https://ghub.io/string-crypto): Small and simple (yet secure) library to encrypt and decrypt strings using PBKDF2 for key derivation and AES (defaulted to 256-bit / SHA512)

## Dev Dependencies

- [eslint](https://ghub.io/eslint): An AST-based pattern checker for JavaScript.
- [eslint-config-standard](https://ghub.io/eslint-config-standard): JavaScript Standard Style - ESLint Shareable Config
- [eslint-plugin-import](https://ghub.io/eslint-plugin-import): Import with sanity.
- [eslint-plugin-node](https://ghub.io/eslint-plugin-node): Additional ESLint&#39;s rules for Node.js
- [eslint-plugin-promise](https://ghub.io/eslint-plugin-promise): Enforce best practices for JavaScript promises
- [prettier-plugin-prisma](https://ghub.io/prettier-plugin-prisma): Prettier plugin for Prisma files

## Install

***CLONE***
```sh
git clone https://github.com/chlasswg26/e-commerce-app-api
```

***INSTALL***

```sh
yarn install
```

OR

```sh
npm install
```



## Setup

| Environment | Value | Description |
| :---------: | :---: | :---------: |
|      DATABASE_URL      | 'mysql://root@localhost:3306/your_database_name' | Database full url / cluster url |
|      FRONTEND_URL      | your_frontend_url | Frontend url without slash in the end for Cross Origin (CORS) |
|      SITE_NAME      | 'site_name' | Site name |
|      PORT      | 5000 | Port |
|      HOST      | 0.0.0.0 | Host |
|      REDIS_PORT      | - | Redis port |
|      REDIS_HOST      | - | Redis host |
|      REDIS_PASSWORD      | - | Redis password |
|      REDIS_TLS      | true | Redis TLS |
|      SMTP_HOST      | - | SMTP host |
|      SMTP_PORT      | - | SMTP port |
|      SMTP_USERNAME      | - | SMTP username |
|      SMTP_PASSWORD      | - | SMTP password |
|      SERVICE_EMAIL      | support@example.com | Service email (Customer Care) |
|      JWT_SECRET_KEY      | - | JWT Secret Key |
|      JWT_REFRESH_SECRET_KEY      | - | JWT Secret Key (Refresh token) |
|      JWT_TOKEN_LIFE      | 4h | JWT Life (4 hours or more) |
|      JWT_REFRESH_TOKEN_LIFE      | 1d | JWT Life (Refresh token 1 day or more) |
|      JWT_ALGORITHM      | HS256 | JWT Algorithm (see on wikipedia algorithm programming) |
|      MAX_FILE_SIZE      | 2 | File size number (2mb or more) |
|      ENCRYPTION_PASSWORD      | - | Encryption password (your password) |
|      ENCRYPTION_SALT      | - | Encryption salt (your salt) |
|      ENCRYPTION_DIGEST      | - | Encryption digest (see on wikipedia algorithm digest) |



## Usage

***Production***

```sh
yarn start
```

***Development***

```sh
yarn dev
```

OR

***Production***

```sh
npm start
```

***Development***

```sh
npm dev
```



## To Do

- [ ] New path of authentication (VERIFY ACCOUNT, FORGOT PASSWORD)
- [ ] Mailer
- [ ] Test


## Author

👤 **Ichlas Wardy Gustama**

* Website: https://chlasswg26.github.io/chlasswg26
* Github: [@chlasswg26](https://github.com/chlasswg26)
* LinkedIn: [@ichlas-wardy](https://linkedin.com/in/ichlas-wardy)

## Show your support

Give a ⭐️ if this project helped you!


## 📝 License

Copyright © 2021 [Ichlas Wardy Gustama](https://github.com/chlasswg26).

This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.

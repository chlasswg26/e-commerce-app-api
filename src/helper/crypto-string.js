const helper = require('../helper')
require('dotenv').config()
const {
  ENCRYPTION_PASSWORD,
  ENCRYPTION_SALT,
  ENCRYPTION_DIGEST
} = process.env
const StringCrypto = require('string-crypto')

module.exports = {
  encrypt: (iterationsNum = 15, data, response) => {
    if (typeof data === 'function') {
      return helper.response(response, 400, {
        message: 'Type of function is not supported!'
      })
    }

    const { encryptString } = new StringCrypto({
      salt: ENCRYPTION_SALT,
      iterations: iterationsNum,
      digest: ENCRYPTION_DIGEST
    })

    return encryptString(typeof data === 'object' ? JSON.stringify(data) : data, ENCRYPTION_PASSWORD)
  },
  decrypt: (iterationsNum = 15, data = '') => {
    const { decryptString } = new StringCrypto({
      salt: ENCRYPTION_SALT,
      iterations: iterationsNum,
      digest: ENCRYPTION_DIGEST
    })
    const decryptionSignedCookie = decryptString(data, ENCRYPTION_PASSWORD)

    return typeof decryptionSignedCookie === 'undefined' ? {} : JSON.parse(decryptionSignedCookie)
  }
}

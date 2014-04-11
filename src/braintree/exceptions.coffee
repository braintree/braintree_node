errorTypes = require('./error_types')

createError (opts) ->
  err = new Error()
  err.message = opts.message
  Object.defineProperty(err, "type", {
    value: opts.type,
    configurable: true,
    enumerable: true,
    writable: true
  })
  err
  

AuthenticationError = ->
  createError({
    message: 'Authentication Error',
    type: errorTypes.authenticationError
  })

AuthorizationError = ->
  createError({
    message: 'Authorization Error',
    type: errorTypes.authorizationError
  })

DownForMaintenanceError = ->
  createError({
    message: 'Down for Maintenance',
    type: errorTypes.downForMaintenanceError
  })

InvalidSignatureError = ->
  createError({
    message: 'Invalid Signature',
    type: errorTypes.invalidSignatureError
  })

InvalidTransparentRedirectHashError = ->
  createError({
    message: 'The transparent redirect hash is invalid.',
    type: errorTypes.invalidTransparentRedirectHashError
  })

NotFoundError = ->
  createError({
    message: 'Not Found',
    type: errorTypes.notFoundError
  })

ServerError = ->
  createError({
    message: 'Server Error',
    type: errorTypes.serverError
  })

UnexpectedError = (message) ->
  createError({
    message: message,
    type: errorTypes.unexpectedError
  })

UpgradeRequired = ->
  createError({
    message: 'This version of the node library is no longer supported.',
    type: errorTypes.upgradeRequired
  })

exports.AuthenticationError = AuthenticationError
exports.AuthorizationError = AuthorizationError
exports.DownForMaintenanceError = DownForMaintenanceError
exports.InvalidTransparentRedirectHashError = InvalidTransparentRedirectHashError
exports.InvalidSignatureError = InvalidSignatureError
exports.NotFoundError = NotFoundError
exports.ServerError = ServerError
exports.UnexpectedError = UnexpectedError
exports.UpgradeRequired = UpgradeRequired

{Gateway} = require('./gateway')
{ErrorResponse} = require('./error_response')
exceptions = require('./exceptions')

DEFAULT_VERSION = 2

class ClientTokenGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  generate: (params={}, callback) ->
    params.version ||= DEFAULT_VERSION

    err = @validateParams(params)
    return callback(err, null) if err
    params = {client_token: params}

    responseHandler = @responseHandler(callback)
    @gateway.http.post("#{@config.baseMerchantPath()}/client_token", params, responseHandler)

  validateParams: (params) ->
    return if params.customerId || !params.options

    options = ["makeDefault", "verifyCard", "failOnDuplicatePaymentMethod"]
    invalidOptions = (name for name in options when params.options[name])

    if invalidOptions.length > 0
      return exceptions.UnexpectedError("Invalid keys: " + invalidOptions.toString())
    else
      return null

  responseHandler: (callback) ->
    (err, response) ->
      return callback(err, response) if err

      if (response.clientToken)
        response.success = true
        response.clientToken = response.clientToken.value
        callback(null, response)
      else if (response.apiErrorResponse)
        callback(null, new ErrorResponse(response.apiErrorResponse))

exports.ClientTokenGateway = ClientTokenGateway

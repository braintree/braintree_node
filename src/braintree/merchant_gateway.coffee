{Gateway} = require('./gateway')
{Merchant} = require('./merchant')
{OAuthCredentials} = require('./oauth_credentials')

class MerchantGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  create: (attributes, callback) ->
    @gateway.http.post('/merchants/create_via_api', {merchant: attributes}, @responseHandler(callback))

  responseHandler: (callback) ->
    @createResponseHandler(null, null, (err, response) ->
      if !err && response.success
        response.merchant = new Merchant(response.response.merchant)
        response.credentials = new OAuthCredentials(response.response.credentials)
        delete response.response
      callback(err, response)
    )

exports.MerchantGateway = MerchantGateway

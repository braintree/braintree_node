{Gateway} = require('./gateway')
{PayPalAccount} = require('./paypal_account')
exceptions = require('./exceptions')

class PayPalAccountGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  find: (token, callback) ->
    if(token.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.get "#{@config.baseMerchantPath()}/payment_methods/paypal_account/#{token}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, new PayPalAccount(response.paypalAccount))

  update: (token, attributes, callback) ->
    @gateway.http.put("#{@config.baseMerchantPath()}/payment_methods/paypal_account/#{token}", {paypalAccount: attributes}, @responseHandler(callback))

  delete: (token, callback) ->
    @gateway.http.delete("#{@config.baseMerchantPath()}/payment_methods/paypal_account/#{token}", callback)

  responseHandler: (callback) ->
    @createResponseHandler("paypalAccount", PayPalAccount, callback)

exports.PayPalAccountGateway = PayPalAccountGateway

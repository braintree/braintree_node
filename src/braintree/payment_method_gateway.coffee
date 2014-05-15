{Gateway} = require('./gateway')
{CreditCard} = require('./credit_card')
{PayPalAccount} = require('./paypal_account')
exceptions = require('./exceptions')

class PaymentMethodGateway extends Gateway
  constructor: (@gateway) ->

  responseHandler: (callback) ->
    @createResponseHandler({paypalAccount: PayPalAccount}, null, callback)

  create: (attributes, callback) ->
    @gateway.http.post('/payment_methods', {paymentMethod: attributes}, @responseHandler(callback))

  find: (token, callback) ->
    if(token.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.get "/payment_methods/any/#{token}", (err, response) ->
        if err
          callback(err, null)
        else if response.creditCard
          callback(null, new CreditCard(response.creditCard))
        else if response.paypalAccount
          callback(null, new PayPalAccount(response.paypalAccount))

  delete: (token, callback) ->
    @gateway.http.delete("/payment_methods/any/#{token}", callback)

exports.PaymentMethodGateway = PaymentMethodGateway

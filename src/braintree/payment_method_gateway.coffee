{Gateway} = require('./gateway')
{CreditCard} = require('./credit_card')
{PayPalAccount} = require('./paypal_account')
{UnknownPaymentMethod} = require('./unknown_payment_method')
exceptions = require('./exceptions')

class PaymentMethodGateway extends Gateway
  constructor: (@gateway) ->

  responseHandler: (callback) ->
    responseMapping =
      paypalAccount: PayPalAccount
      creditCard: CreditCard
    @createResponseHandler(responseMapping, null, (err, response) ->
      response.paymentMethod = response.paypalAccount || response.creditCard
      delete response.paypalAccount
      delete response.creditCard
      callback(err, response)
    )

  create: (attributes, callback) ->
    @gateway.http.post('/payment_methods', {paymentMethod: attributes}, @responseHandler(callback))

  find: (token, callback) ->
    if(token.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.get "/payment_methods/any/#{token}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, PaymentMethodGateway.parsePaymentMethod(response))

  @parsePaymentMethod: (response) ->
    if response.creditCard
      new CreditCard(response.creditCard)
    else if response.paypalAccount
      new PayPalAccount(response.paypalAccount)
    else
      new UnknownPaymentMethod(response)

  delete: (token, callback) ->
    @gateway.http.delete("/payment_methods/any/#{token}", callback)

exports.PaymentMethodGateway = PaymentMethodGateway

{Gateway} = require('./gateway')
{ApplePayCard} = require('./apple_pay_card')
{AndroidPayCard} = require('./android_pay_card')
{CreditCard} = require('./credit_card')
{PayPalAccount} = require('./paypal_account')
{CoinbaseAccount} = require('./coinbase_account')
{UnknownPaymentMethod} = require('./unknown_payment_method')
exceptions = require('./exceptions')

class PaymentMethodGateway extends Gateway
  constructor: (@gateway) ->

  responseHandler: (callback) ->
    responseMapping =
      paypalAccount: PayPalAccount
      coinbaseAccount: CoinbaseAccount
      creditCard: CreditCard
      applePayCard: ApplePayCard
      androidPayCard: AndroidPayCard
    @createResponseHandler(responseMapping, null, (err, response) ->
      if !err
        response.paymentMethod = PaymentMethodGateway.parsePaymentMethod(response)
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

  update: (token, attributes, callback) ->
    if(token.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.put("/payment_methods/any/#{token}", {paymentMethod: attributes}, @responseHandler(callback))

  @parsePaymentMethod: (response) ->
    if response.creditCard
      new CreditCard(response.creditCard)
    else if response.paypalAccount
      new PayPalAccount(response.paypalAccount)
    else if response.applePayCard
      new ApplePayCard(response.applePayCard)
    else if response.androidPayCard
      new AndroidPayCard(response.androidPayCard)
    else if response.coinbaseAccount
      new CoinbaseAccount(response.coinbaseAccount)
    else
      new UnknownPaymentMethod(response)

  delete: (token, callback) ->
    @gateway.http.delete("/payment_methods/any/#{token}", callback)

exports.PaymentMethodGateway = PaymentMethodGateway

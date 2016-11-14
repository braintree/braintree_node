{Gateway} = require('./gateway')
{ApplePayCard} = require('./apple_pay_card')
{AndroidPayCard} = require('./android_pay_card')
{CreditCard} = require('./credit_card')
{PayPalAccount} = require('./paypal_account')
{CoinbaseAccount} = require('./coinbase_account')
{UnknownPaymentMethod} = require('./unknown_payment_method')
{PaymentMethodNonce} = require('./payment_method_nonce')
{UsBankAccount} = require('./us_bank_account')
{VenmoAccount} = require('./venmo_account')
{Util} = require('./util')
exceptions = require('./exceptions')

class PaymentMethodGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  responseHandler: (callback) ->
    responseMapping =
      paypalAccount: PayPalAccount
      coinbaseAccount: CoinbaseAccount
      creditCard: CreditCard
      applePayCard: ApplePayCard
      androidPayCard: AndroidPayCard
      paymentMethodNonce: PaymentMethodNonce
    @createResponseHandler(responseMapping, null, (err, response) ->
      if !err
        parsedResponse = PaymentMethodGateway.parsePaymentMethod(response)
        if parsedResponse instanceof PaymentMethodNonce
          response.paymentMethodNonce = parsedResponse
        else
          response.paymentMethod = parsedResponse
      callback(err, response)
    )

  create: (attributes, callback) ->
    @gateway.http.post("#{@config.baseMerchantPath()}/payment_methods", {paymentMethod: attributes}, @responseHandler(callback))

  find: (token, callback) ->
    if(token.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.get "#{@config.baseMerchantPath()}/payment_methods/any/#{token}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, PaymentMethodGateway.parsePaymentMethod(response))

  update: (token, attributes, callback) ->
    if(token.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.put("#{@config.baseMerchantPath()}/payment_methods/any/#{token}", {paymentMethod: attributes}, @responseHandler(callback))

  grant: (token, attributes, callback) ->
    if(token.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      grantOptions = {
        sharedPaymentMethodToken: token
      }
      if typeof attributes is 'boolean'
        attributes = { allow_vaulting: attributes }
      
      grantOptions = Util.merge(grantOptions, attributes)
      @gateway.http.post(
        "#{@config.baseMerchantPath()}/payment_methods/grant",
        {
          payment_method: grantOptions
        },
        @responseHandler(callback)
      )

  revoke: (token, callback) ->
    if(token.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.post(
        "#{@config.baseMerchantPath()}/payment_methods/revoke",
        {
          payment_method: {
            sharedPaymentMethodToken: token
          }
        },
        @responseHandler(callback)
      )

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
    else if response.paymentMethodNonce
      new PaymentMethodNonce(response.paymentMethodNonce)
    else if response.usBankAccount
      new UsBankAccount(response.usBankAccount)
    else if response.venmoAccount
      new VenmoAccount(response.venmoAccount)
    else
      new UnknownPaymentMethod(response)

  delete: (token, callback) ->
    @gateway.http.delete("#{@config.baseMerchantPath()}/payment_methods/any/#{token}", callback)

exports.PaymentMethodGateway = PaymentMethodGateway

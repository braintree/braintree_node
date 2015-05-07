{Gateway} = require('./gateway')
{PaymentMethodNonce} = require('./payment_method_nonce')
exceptions = require('./exceptions')

class PaymentMethodNonceGateway extends Gateway
  constructor: (@gateway) ->

  responseHandler: (callback) ->
    @createResponseHandler("payment_method_nonce", PaymentMethodNonce, (err, response) ->
      if !err
        response.paymentMethodNonce = new PaymentMethodNonce(response.paymentMethodNonce)
      callback(err, response)
    )

  create: (payment_method_token, callback) ->
    @gateway.http.post("/payment_methods/#{payment_method_token}/nonces", {}, @responseHandler(callback))

  find: (payment_method_nonce, callback) ->
    @gateway.http.get("/payment_method_nonces/#{payment_method_nonce}", (err, response) ->
      if err
        callback(err, null)
      else
        callback(null, new PaymentMethodNonce(response.paymentMethodNonce)))

exports.PaymentMethodNonceGateway = PaymentMethodNonceGateway

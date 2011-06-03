{CreditCard} = require('./credit_card')
{ErrorResponse} = require('./error_response')

class CreditCardGateway
  constructor: (@gateway) ->

  create: (attributes, callback) ->
    @gateway.http.post('/payment_methods', {creditCard: attributes}, @responseHandler(callback))

  delete: (token, callback) ->
    @gateway.http.delete("/payment_methods/#{token}", callback)

  find: (token, callback) ->
    @gateway.http.get "/payment_methods/#{token}", (err, response) ->
      if err
        callback(err, null)
      else
        callback(null, new CreditCard(response.creditCard))

  update: (token, attributes, callback) ->
    @gateway.http.put("/payment_methods/#{token}", {creditCard: attributes}, @responseHandler(callback))

  responseHandler: (callback) ->
    (err, response) ->
      return callback(err, response) if err

      if (response.creditCard)
        response.success = true
        response.creditCard = new CreditCard(response.creditCard)
        callback(null, response)
      else if (response.apiErrorResponse)
        callback(null, ErrorResponse(response.apiErrorResponse))

exports.CreditCardGateway = CreditCardGateway

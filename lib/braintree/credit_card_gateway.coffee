CreditCard = require('./credit_card').CreditCard
ErrorResponse = require('./error_response').ErrorResponse

CreditCardGateway = (gateway) ->
  my = { gateway: gateway }

  create = (attributes, callback) ->
    my.gateway.http.post('/payment_methods', {creditCard: attributes}, responseHandler(callback))

  destroy = (token, callback) ->
    my.gateway.http.delete('/payment_methods/' + token, callback)

  find = (token, callback) ->
    callback = callback
    my.gateway.http.get('/payment_methods/' + token, (err, response) ->
      return callback(err, null) if err
      callback(null, CreditCard(response.creditCard))
    )


  update = (token, attributes, callback) ->
    my.gateway.http.put(
      '/payment_methods/' + token,
      {creditCard: attributes},
      responseHandler(callback)
    )

  responseHandler = (callback) ->
    return (err, response) ->
      return callback(err, response) if err

      if (response.creditCard)
        response.success = true
        response.creditCard = CreditCard(response.creditCard)
        callback(null, response)
      else if (response.apiErrorResponse)
        callback(null, ErrorResponse(response.apiErrorResponse))

  {
    create: create,
    delete: destroy,
    find: find,
    responseHandler: responseHandler,
    update: update
  }

exports.CreditCardGateway = CreditCardGateway;


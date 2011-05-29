ErrorResponse = require('./error_response').ErrorResponse

AddressGateway = (gateway) ->
  my = { gateway: gateway }

  create = (attributes, callback) ->
    customerId = attributes.customerId
    delete(attributes.customerId)
    my.gateway.http.post("/customers/#{customerId}/addresses", {address: attributes}, responseHandler(callback))

  # destroy = (token, callback) ->
  #   my.gateway.http.delete('/payment_methods/' + token, callback)

  # find = (token, callback) ->
  #   callback = callback
  #   my.gateway.http.get('/payment_methods/' + token, (err, response) ->
  #     return callback(err, null) if err
  #     callback(null, CreditCard(response.creditCard))
  #   )


  # update = (token, attributes, callback) ->
  #   my.gateway.http.put(
  #     '/payment_methods/' + token,
  #     {creditCard: attributes},
  #     responseHandler(callback)
  #   )

  responseHandler = (callback) ->
    return (err, response) ->
      return callback(err, response) if err

      if (response.address)
        response.success = true
        callback(null, response)
      # else if (response.apiErrorResponse)
      #   callback(null, ErrorResponse(response.apiErrorResponse))

  {
    create: create,
    # delete: destroy,
    # find: find,
    # responseHandler: responseHandler,
    # update: update
  }

exports.AddressGateway = AddressGateway


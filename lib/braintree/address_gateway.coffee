{ErrorResponse} = require('./error_response')

AddressGateway = (gateway) ->
  my = { gateway: gateway }

  create = (attributes, callback) ->
    customerId = attributes.customerId
    delete(attributes.customerId)
    my.gateway.http.post("/customers/#{customerId}/addresses", {address: attributes}, responseHandler(callback))

  destroy = (customerId, id, callback) ->
    my.gateway.http.delete("/customers/#{customerId}/addresses/#{id}", callback)

  find = (customerId, id, callback) ->
    callback = callback
    my.gateway.http.get("/customers/#{customerId}/addresses/#{id}" , (err, response) ->
      return callback(err, null) if err
      callback(null, response.address)
    )


  update = (customerId, id, attributes, callback) ->
    my.gateway.http.put("/customers/#{customerId}/addresses/#{id}", {address: attributes}, responseHandler(callback))

  responseHandler = (callback) ->
    return (err, response) ->
      return callback(err, response) if err

      if (response.address)
        response.success = true
        callback(null, response)
      else if (response.apiErrorResponse)
        callback(null, ErrorResponse(response.apiErrorResponse))

  {
    create: create,
    delete: destroy,
    find: find,
    update: update
  }

exports.AddressGateway = AddressGateway


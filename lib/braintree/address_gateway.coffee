{Address} = require('./address')
{ErrorResponse} = require('./error_response')

class AddressGateway
  constructor: (@gateway) ->

  create: (attributes, callback) ->
    customerId = attributes.customerId
    delete(attributes.customerId)
    @gateway.http.post("/customers/#{customerId}/addresses", {address: attributes}, @responseHandler(callback))

  delete: (customerId, id, callback) ->
    @gateway.http.delete("/customers/#{customerId}/addresses/#{id}", callback)

  find: (customerId, id, callback) ->
    @gateway.http.get "/customers/#{customerId}/addresses/#{id}", (err, response) ->
      if err
        callback(err, null)
      else
        callback(null, response.address)

  update: (customerId, id, attributes, callback) ->
    @gateway.http.put("/customers/#{customerId}/addresses/#{id}", {address: attributes}, @responseHandler(callback))

  responseHandler: (callback) ->
    (err, response) ->
      return callback(err, response) if err

      if (response.address)
        response.success = true
        response.address = new Address(response.address)
        callback(null, response)
      else if (response.apiErrorResponse)
        callback(null, new ErrorResponse(response.apiErrorResponse))

exports.AddressGateway = AddressGateway

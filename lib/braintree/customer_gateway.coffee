{Customer} = require('./customer')
{ErrorResponse} = require('./error_response')

class CustomerGateway
  constructor: (@gateway) ->

  create: (attributes, callback) ->
    @gateway.http.post('/customers', {customer: attributes}, @responseHandler(callback))

  delete: (customerId, callback) ->
    @gateway.http.delete("/customers/#{customerId}", callback)

  find: (customerId, callback) ->
    @gateway.http.get "/customers/#{customerId}", (err, response) ->
      if err
        callback(err, null)
      else
        callback(null, new Customer(response.customer))

  update: (customerId, attributes, callback) ->
    @gateway.http.put("/customers/#{customerId}", {customer: attributes}, @responseHandler(callback))

  responseHandler: (callback) ->
    (err, response) ->
      return callback(err, response) if err

      if (response.customer)
        response.success = true
        response.customer = new Customer(response.customer)
        callback(null, response)
      else if (response.apiErrorResponse)
        callback(null, new ErrorResponse(response.apiErrorResponse))

exports.CustomerGateway = CustomerGateway

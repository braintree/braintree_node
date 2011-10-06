{Gateway} = require('./gateway')
{Customer} = require('./customer')
exceptions = require('./exceptions')

class CustomerGateway extends Gateway
  constructor: (@gateway) ->

  create: (attributes, callback) ->
    @gateway.http.post('/customers', {customer: attributes}, @responseHandler(callback))

  delete: (customerId, callback) ->
    @gateway.http.delete("/customers/#{customerId}", callback)

  find: (customerId, callback) ->
    if(customerId.trim() == '')
      callback(exceptions.NotFoundError(), null)
    else
      @gateway.http.get "/customers/#{customerId}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, new Customer(response.customer))

  update: (customerId, attributes, callback) ->
    @gateway.http.put("/customers/#{customerId}", {customer: attributes}, @responseHandler(callback))

  responseHandler: (callback) ->
    @createResponseHandler("customer", Customer, callback)

exports.CustomerGateway = CustomerGateway

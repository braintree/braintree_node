Customer = require('./customer').Customer
ErrorResponse = require('./error_response').ErrorResponse

CustomerGateway = (gateway) ->
  my = { gateway: gateway }

  create = (attributes, callback) ->
    my.gateway.http.post('/customers', {customer: attributes}, responseHandler(callback))

  destroy = (customer_id, callback) ->
    my.gateway.http.delete('/customers/' + customer_id, callback)

  find = (customer_id, callback) ->
    callback = callback
    my.gateway.http.get('/customers/' + customer_id, (err, response) ->
      return callback(err, null) if err
      callback(null, Customer(response.customer))
    )

  update = (customer_id, attributes, callback) ->
    my.gateway.http.put(
      '/customers/' + customer_id,
      { customer: attributes },
      responseHandler(callback)
    )

  responseHandler = (callback) ->
    (err, response) ->
      return callback(err, response) if err

      if (response.customer)
        response.success = true
        response.customer = Customer(response.customer)
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

exports.CustomerGateway = CustomerGateway


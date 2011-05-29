Subscription = require('./subscription').Subscription
ErrorResponse = require('./error_response').ErrorResponse
TransactionGateway = require('./transaction_gateway').TransactionGateway

SubscriptionGateway = (gateway) ->
  my = { gateway: gateway }

  create = (attributes, callback) ->
    my.gateway.http.post('/subscriptions', {subscription: attributes}, responseHandler(callback))

  cancel = (subscription_id, callback) ->
    my.gateway.http.put('/subscriptions/' + subscription_id + '/cancel', null, responseHandler(callback))

  find = (subscription_id, callback) ->
    my.gateway.http.get('/subscriptions/' + subscription_id, (err, response) ->
      return callback(err, null) if err
      callback(null, Subscription(response.subscription))
    )

  responseHandler = (callback) ->
    (err, response) ->
      return callback(err, response) if err

      if response.subscription
        response.success = true
        response.subscription = Subscription(response.subscription)
        callback(null, response)
      else if (response.apiErrorResponse)
        callback(null, ErrorResponse(response.apiErrorResponse))

  retryCharge = (subscriptionId, amount..., callback) ->
    TransactionGateway(my.gateway).sale({
      amount: amount[0],
      subscriptionId: subscriptionId
    }, callback)

  update = (subscriptionId, attributes, callback) ->
    my.gateway.http.put(
      "/subscriptions/#{subscriptionId}",
      { subscription: attributes },
      responseHandler(callback)
    )

  {
    cancel: cancel,
    create: create,
    find: find,
    retryCharge: retryCharge
    update: update
  }

exports.SubscriptionGateway = SubscriptionGateway


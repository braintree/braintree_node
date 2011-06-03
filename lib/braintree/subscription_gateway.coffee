{Subscription} = require('./subscription')
{ErrorResponse} = require('./error_response')
{TransactionGateway} = require('./transaction_gateway')

class SubscriptionGateway
  constructor: (@gateway) ->

  create: (attributes, callback) ->
    @gateway.http.post('/subscriptions', {subscription: attributes}, @responseHandler(callback))

  cancel: (subscriptionId, callback) ->
    @gateway.http.put("/subscriptions/#{subscriptionId}/cancel", null, @responseHandler(callback))

  find: (subscriptionId, callback) ->
    @gateway.http.get "/subscriptions/#{subscriptionId}", (err, response) ->
      if err
        callback(err, null)
      else
        callback(null, Subscription(response.subscription))

  responseHandler: (callback) ->
    (err, response) ->
      return callback(err, response) if err

      if response.subscription
        response.success = true
        response.subscription = Subscription(response.subscription)
        callback(null, response)
      else if (response.apiErrorResponse)
        callback(null, ErrorResponse(response.apiErrorResponse))

  retryCharge: (subscriptionId, amount..., callback) ->
    TransactionGateway(@gateway).sale
      amount: amount[0],
      subscriptionId: subscriptionId
    , callback

  update: (subscriptionId, attributes, callback) ->
    @gateway.http.put("/subscriptions/#{subscriptionId}", {subscription: attributes}, @responseHandler(callback))

exports.SubscriptionGateway = SubscriptionGateway

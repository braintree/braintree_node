{Transaction} = require('./transaction')
{ErrorResponse} = require('./error_response')

class TransactionGateway
  constructor: (@gateway) ->

  create: (attributes, callback) ->
    @gateway.http.post('/transactions', {transaction: attributes}, @responseHandler(callback))

  credit: (attributes, callback) ->
    attributes.type = 'credit'
    @create(attributes, callback)

  find: (transactionId, callback) ->
    @gateway.http.get "/transactions/#{transactionId}", (err, response) ->
      if err
        callback(err, null)
      else
        callback(null, Transaction(response.transaction))

  refund: (transactionId, amount..., callback) ->
    @gateway.http.post("/transactions/#{transactionId}/refund", {transaction: {amount: amount[0]}}, @responseHandler(callback))

  responseHandler: (callback) ->
    (err, response) ->
      return callback(err, response) if err

      if (response.transaction)
        response.success = true
        response.transaction = Transaction(response.transaction)
        callback(null, response)
      else if (response.apiErrorResponse)
        callback(null, new ErrorResponse(response.apiErrorResponse))

  sale: (attributes, callback) ->
    attributes.type = 'sale'
    @create(attributes, callback)

  submitForSettlement: (transactionId, amount..., callback) ->
    @gateway.http.put("/transactions/#{transactionId}/submit_for_settlement",
      {transaction: {amount: amount[0]}},
      @responseHandler(callback)
    )

  void: (transactionId, callback) ->
    @gateway.http.put("/transactions/#{transactionId}/void", null, @responseHandler(callback))

exports.TransactionGateway = TransactionGateway

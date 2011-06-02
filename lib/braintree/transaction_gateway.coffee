{Transaction} = require('./transaction')
{ErrorResponse} = require('./error_response')

TransactionGateway = (gateway) ->
  my = { gateway: gateway }

  create = (attributes, callback) ->
    my.gateway.http.post('/transactions', {transaction: attributes}, responseHandler(callback))

  find = (transaction_id, callback) ->
    my.gateway.http.get('/transactions/' + transaction_id, (err, response) ->
      return callback(err, null) if err
      callback(null, Transaction(response.transaction))
    )

  responseHandler = (callback) ->
    (err, response) ->
      return callback(err, response) if err

      if (response.transaction)
        response.success = true
        response.transaction = Transaction(response.transaction)
        callback(null, response)
      else if (response.apiErrorResponse)
        callback(null, ErrorResponse(response.apiErrorResponse))

  {
    find: find

    responseHandler: responseHandler

    credit: (attributes, callback) ->
      attributes.type = 'credit'
      create(attributes, callback)

    refund: (transactionId, amount..., callback) ->
      my.gateway.http.post(
        "/transactions/#{transactionId}/refund",
        { transaction: { amount: amount[0] } },
        responseHandler(callback)
      )

    sale: (attributes, callback) ->
      attributes.type = 'sale'
      create(attributes, callback)

    submitForSettlement: (transactionId, amount..., callback) ->
      my.gateway.http.put(
        "/transactions/#{transactionId}/submit_for_settlement",
        { transaction: { amount: amount[0] } },
        responseHandler(callback)
      )

    void: (transaction_id, callback) ->
      my.gateway.http.put('/transactions/' + transaction_id + '/void', null, responseHandler(callback))
  }

exports.TransactionGateway = TransactionGateway

Transaction = require('./transaction').Transaction
ErrorResponse = require('./error_response').ErrorResponse

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

    refund: (transaction_id, amount_or_callback, callback_or_null) ->
      amount = if typeof(amount_or_callback) is 'function' then null else amount_or_callback
      callback = if typeof(amount_or_callback) is 'function' then amount_or_callback else callback_or_null
      my.gateway.http.post('/transactions/' + transaction_id + '/refund', {transaction: {amount: amount}}, responseHandler(callback))

    sale: (attributes, callback) ->
      attributes.type = 'sale'
      create(attributes, callback)

    submitForSettlement: (transaction_id, callback) ->
      my.gateway.http.put('/transactions/' + transaction_id + '/submit_for_settlement', null, responseHandler(callback))

    void: (transaction_id, callback) ->
      my.gateway.http.put('/transactions/' + transaction_id + '/void', null, responseHandler(callback))
  }

exports.TransactionGateway = TransactionGateway

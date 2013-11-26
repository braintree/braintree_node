{Gateway} = require('./gateway')
{Transaction} = require('./transaction')
{TransactionSearch} = require('./transaction_search')
{ErrorResponse} = require('./error_response')
exceptions = require('./exceptions')
_ = require('underscore')

class TransactionGateway extends Gateway
  constructor: (@gateway) ->

  cancelRelease: (transactionId, callback) ->
    @gateway.http.put("/transactions/#{transactionId}/cancel_release",
      {},
      @responseHandler(callback)
    )

  cloneTransaction: (transactionId, attributes, callback) ->
    @gateway.http.post("/transactions/#{transactionId}/clone", {transactionClone: attributes}, @responseHandler(callback))

  create: (attributes, callback) ->
    @gateway.http.post('/transactions', {transaction: attributes}, @responseHandler(callback))

  credit: (attributes, callback) ->
    attributes.type = 'credit'
    @create(attributes, callback)

  find: (transactionId, callback) ->
    if(transactionId.trim() == '')
      callback(exceptions.NotFoundError(), null)
    else
      @gateway.http.get "/transactions/#{transactionId}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, new Transaction(response.transaction))

  holdInEscrow: (transactionId, callback) ->
    @gateway.http.put("/transactions/#{transactionId}/hold_in_escrow",
      {},
      @responseHandler(callback)
    )

  refund: (transactionId, amount..., callback) ->
    @gateway.http.post("/transactions/#{transactionId}/refund", {transaction: {amount: amount[0]}}, @responseHandler(callback))

  responseHandler: (callback) ->
    @createResponseHandler("transaction", Transaction, callback)

  sale: (attributes, callback) ->
    attributes.type = 'sale'
    @create(attributes, callback)

  search: (fn, callback) ->
    search = new TransactionSearch()
    fn(search)
    @gateway.http.post("/transactions/advanced_search_ids",
      { search : search.toHash() }, @searchResponseHandler(@pagingFunctionGenerator(search), callback))

  releaseFromEscrow: (transactionId, callback) ->
    @gateway.http.put("/transactions/#{transactionId}/release_from_escrow",
      {},
      @responseHandler(callback)
    )

  submitForSettlement: (transactionId, amount..., callback) ->
    @gateway.http.put("/transactions/#{transactionId}/submit_for_settlement",
      {transaction: {amount: amount[0]}},
      @responseHandler(callback)
    )

  void: (transactionId, callback) ->
    @gateway.http.put("/transactions/#{transactionId}/void", null, @responseHandler(callback))

  pagingFunctionGenerator: (search) ->
    (ids, callback) =>
      search.ids().in(ids)
      @gateway.http.post("/transactions/advanced_search",
        { search : search.toHash() },
        (err, response) ->
          if err
            callback(err, null)
          else
            results = []
            if _.isArray(response.creditCardTransactions.transaction)
              for transaction in response.creditCardTransactions.transaction
                results.push(new Transaction(transaction))
            else
              results.push(new Transaction(response.creditCardTransactions.transaction))

            callback(null, results)
      )


exports.TransactionGateway = TransactionGateway

{Gateway} = require('./gateway')
{Transaction} = require('./transaction')
{TransactionSearch} = require('./transaction_search')
{ErrorResponse} = require('./error_response')
exceptions = require('./exceptions')
_ = require('underscore')

class TransactionGateway extends Gateway
  constructor: (@gateway) ->

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

  submitForSettlement: (transactionId, amount..., callback) ->
    @gateway.http.put("/transactions/#{transactionId}/submit_for_settlement",
      {transaction: {amount: amount[0]}},
      @responseHandler(callback)
    )

  void: (transactionId, callback) ->
    @gateway.http.put("/transactions/#{transactionId}/void", null, @responseHandler(callback))

  pagingFunctionGenerator: (search) ->
    (ids, callback) =>
      @gateway.http.post("/transactions/advanced_search",
        { search : search.toHash() },
        (err, response) ->
          if err
            callback(err, null)
          else
            if _.isArray(response.creditCardTransactions.transaction)
              for transaction in response.creditCardTransactions.transaction
                callback(null, new Transaction(transaction))
            else
              callback(null, new Transaction(response.creditCardTransactions.transaction)))


exports.TransactionGateway = TransactionGateway

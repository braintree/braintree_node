{Gateway} = require('./gateway')
{Transaction} = require('./transaction')
{TransactionSearch} = require('./transaction_search')
{ErrorResponse} = require('./error_response')
{Util} = require('./util')
exceptions = require('./exceptions')
deprecate = require('depd')('braintree/gateway.transaction')

class TransactionGateway extends Gateway
  SUBMIT_FOR_SETTLEMENT_SIGNATURE: ["orderId", "descriptor[name]", "descriptor[phone]", "descriptor[url]"]
  UPDATE_DETAILS_SIGNATURE: ["amount", "orderId", "descriptor[name]", "descriptor[phone]", "descriptor[url]"]
  constructor: (@gateway) ->
    @config = @gateway.config

  cancelRelease: (transactionId, callback) ->
    @gateway.http.put("#{@config.baseMerchantPath()}/transactions/#{transactionId}/cancel_release",
      {},
      @responseHandler(callback)
    )

  cloneTransaction: (transactionId, attributes, callback) ->
    @gateway.http.post("#{@config.baseMerchantPath()}/transactions/#{transactionId}/clone", {transactionClone: attributes}, @responseHandler(callback))

  create: (attributes, callback) ->
    @gateway.http.post("#{@config.baseMerchantPath()}/transactions", {transaction: attributes}, @responseHandler(callback))

  credit: (attributes, callback) ->
    attributes.type = 'credit'
    @create(attributes, callback)

  find: (transactionId, callback) ->
    if(transactionId.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.get "#{@config.baseMerchantPath()}/transactions/#{transactionId}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, new Transaction(response.transaction))

  holdInEscrow: (transactionId, callback) ->
    @gateway.http.put("#{@config.baseMerchantPath()}/transactions/#{transactionId}/hold_in_escrow",
      {},
      @responseHandler(callback)
    )

  refund: (transactionId, amount..., callback) ->
    @gateway.http.post("#{@config.baseMerchantPath()}/transactions/#{transactionId}/refund", {transaction: {amount: amount[0]}}, @responseHandler(callback))

  responseHandler: (callback) ->
    @createResponseHandler("transaction", Transaction, callback)

  sale: (attributes, callback) ->
    attributes.type = 'sale'
    @create(attributes, callback)

  search: (fn, callback) ->
    search = new TransactionSearch()
    fn(search)
    @createSearchResponse("#{@config.baseMerchantPath()}/transactions/advanced_search_ids", search, @pagingFunctionGenerator(search), callback)

  releaseFromEscrow: (transactionId, callback) ->
    @gateway.http.put("#{@config.baseMerchantPath()}/transactions/#{transactionId}/release_from_escrow",
      {},
      @responseHandler(callback)
    )

  submitForSettlement: (transactionId, attributes..., callback) ->
    amount = attributes[0]
    options = attributes[1] || {}
    deprecate("Received too many args for submitForSettlement (" + arguments.length + " for 4)") if arguments.length > 4
    Util.verifyKeys(@SUBMIT_FOR_SETTLEMENT_SIGNATURE, options, deprecate)

    @gateway.http.put("#{@config.baseMerchantPath()}/transactions/#{transactionId}/submit_for_settlement",
      {transaction: {amount: amount, orderId: options["orderId"], descriptor: options["descriptor"]}},
      @responseHandler(callback)
    )

  updateDetails: (transactionId, options, callback) ->
    Util.verifyKeys(@UPDATE_DETAILS_SIGNATURE, options, deprecate)

    @gateway.http.put("#{@config.baseMerchantPath()}/transactions/#{transactionId}/update_details",
      {transaction: options},
      @responseHandler(callback)
    )

  submitForPartialSettlement: (transactionId, attributes..., callback) ->
    amount = attributes[0]
    options = attributes[1] || {}
    Util.verifyKeys(@SUBMIT_FOR_SETTLEMENT_SIGNATURE, options, deprecate)

    @gateway.http.post("#{@config.baseMerchantPath()}/transactions/#{transactionId}/submit_for_partial_settlement",
      {transaction: {amount: amount, orderId: options["orderId"], descriptor: options["descriptor"]}},
      @responseHandler(callback)
    )

  void: (transactionId, callback) ->
    @gateway.http.put("#{@config.baseMerchantPath()}/transactions/#{transactionId}/void", null, @responseHandler(callback))

  pagingFunctionGenerator: (search) ->
    super search, 'transactions', Transaction, (response) -> response.creditCardTransactions.transaction

exports.TransactionGateway = TransactionGateway

{Gateway} = require('./gateway')
{ErrorResponse} = require('./error_response')
{Environment} = require('./environment')
{TestOperationPerformedInProductionError} = require('./exceptions')
exceptions = require('./exceptions')

class TestingGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  settle: (transactionId, callback) ->
    this.settlementOperationWithEnvironmentCheck(transactionId, "settle", callback)

  settlementPending: (transactionId, callback) ->
    this.settlementOperationWithEnvironmentCheck(transactionId, "settlement_pending", callback)

  settlementConfirm: (transactionId, callback) ->
    this.settlementOperationWithEnvironmentCheck(transactionId, "settlement_confirm", callback)

  settlementDecline: (transactionId, callback) ->
    this.settlementOperationWithEnvironmentCheck(transactionId, "settlement_decline", callback)

  settlementOperationWithEnvironmentCheck: (transactionId, operation, callback) ->
    if @config.environment == Environment.Production
      callback(TestOperationPerformedInProductionError("Test operation performed in production"), null)
    else
      @gateway.http.put(
        "#{@config.baseMerchantPath()}/transactions/#{transactionId}/#{operation}",
        null,
        callback
      )

exports.TestingGateway = TestingGateway

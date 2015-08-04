{Environment} = require('./environment')
{TestOperationPerformedInProductionError} = require('./exceptions')

class TestTransaction

  settlementOperationWithEnvironmentCheck: (gateway, transactionId, operation, callback) ->
    if gateway.config.environment == Environment.Production
      callback(TestOperationPerformedInProductionError("Test operation performed in production"), null)
    else
      gateway.http.put(
        "#{gateway.config.baseMerchantPath()}/transactions/#{transactionId}/#{operation}",
        null,
        callback
      )

  settle: (gateway, transactionId, callback) ->
    this.settlementOperationWithEnvironmentCheck(gateway, transactionId, "settle", callback)

  settlementPending: (gateway, transactionId, callback) ->
    this.settlementOperationWithEnvironmentCheck(gateway, transactionId, "settlement_pending", callback)

  settlementConfirm: (gateway, transactionId, callback) ->
    this.settlementOperationWithEnvironmentCheck(gateway, transactionId, "settlement_confirm", callback)

  settlementDecline: (gateway, transactionId, callback) ->
    this.settlementOperationWithEnvironmentCheck(gateway, transactionId, "settlement_decline", callback)

exports.TestTransaction = TestTransaction

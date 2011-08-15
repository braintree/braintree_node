{Gateway} = require('./gateway')
{SettlementBatchSummary} = require('./settlement_batch_summary')

class SettlementBatchSummaryGateway extends Gateway
  constructor: (@gateway) ->

  generate: (settlementDate, callback) ->
    criteria = {settlementDate: settlementDate}
    @gateway.http.post("/settlement_batch_summary", {settlementBatchSummary: criteria}, @responseHandler(callback))

  responseHandler: (callback) ->
    @createResponseHandler("settlementBatchSummary", SettlementBatchSummary, callback)

exports.SettlementBatchSummaryGateway = SettlementBatchSummaryGateway

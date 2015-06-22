{Gateway} = require('./gateway')
{Disbursement} = require('./disbursement')

class DisbursementGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  transactions: (disbursement, callback) ->
    transactionIds = disbursement.transactionIds
    @gateway.transaction.search(((search) ->
      search.ids().in(transactionIds)),
      callback)

exports.DisbursementGateway = DisbursementGateway

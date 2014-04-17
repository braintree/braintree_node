{Gateway} = require('./gateway')
{Disbursement} = require('./disbursement')
exceptions = require('./exceptions')

class DisbursementGateway extends Gateway
  constructor: (@gateway) ->

  transactions: (disbursement, callback) ->
    transactionIds = disbursement.transactionIds
    @gateway.transaction.search(((search) ->
      search.ids().in(transactionIds)),
      callback)

exports.DisbursementGateway = DisbursementGateway

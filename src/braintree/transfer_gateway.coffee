{Gateway} = require('./gateway')
{Transfer} = require('./transfer')
exceptions = require('./exceptions')

class TransferGateway extends Gateway
  constructor: (@gateway) ->

  merchantAccount: (transfer, callback) ->
    @gateway.merchantAccount.find(transfer.merchant_account_id, callback)

  transactions: (transfer, callback) ->
    merchant_account_id = transfer.merchant_account_id
    disbursement_date = transfer.disbursement_date
    @gateway.transaction.search(((search) ->
      search.merchantAccountId().is(merchant_account_id)
      search.disbursementDate().is(disbursement_date)),
      callback)

exports.TransferGateway = TransferGateway

{AttributeSetter} = require('./attribute_setter')

class Transfer extends AttributeSetter
  constructor: (attributes) ->
    super attributes

  merchantAccount: (gateway, callback) ->
    gateway.merchantAccount.find(@merchant_account_id, callback)

  transactions: (gateway, callback) ->
    merchant_account_id = @merchant_account_id
    disbursement_date = @disbursement_date
    gateway.transaction.search(((search) ->
      search.merchantAccountId().is(merchant_account_id)
      search.disbursementDate().is(disbursement_date)),
      callback)

exports.Transfer = Transfer

{Gateway} = require('./gateway')
{Transfer} = require('./transfer')
exceptions = require('./exceptions')

class TransferGateway extends Gateway
  constructor: (@gateway) ->
    @memoizedMerchantAccount = null

  merchantAccount: (transfer, callback) ->
    if (@memoizedMerchantAccount == null)
      @gateway.merchantAccount.find(transfer.merchant_account_id, (err, merchantAccount) =>
        @memoizedMerchantAccount = merchantAccount unless err
        callback(err, @memoizedMerchantAccount)
      )
    else
      callback(null, @memoizedMerchantAccount)

  transactions: (transfer, callback) ->
    merchant_account_id = transfer.merchant_account_id
    disbursement_date = transfer.disbursement_date
    @gateway.transaction.search(((search) ->
      search.merchantAccountId().is(merchant_account_id)
      search.disbursementDate().is(disbursement_date)),
      callback)

exports.TransferGateway = TransferGateway

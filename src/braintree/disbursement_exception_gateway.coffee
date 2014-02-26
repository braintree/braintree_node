{Gateway} = require('./gateway')
{Disbursement} = require('./disbursement')
exceptions = require('./exceptions')

class DisbursementExceptionGateway extends Gateway
  constructor: (@gateway) ->
    @memoizedMerchantAccount = null

  merchantAccount: (disbursement, callback) ->
    if (@memoizedMerchantAccount == null)
      @gateway.merchantAccount.find(disbursement.merchant_account_id, (err, merchantAccount) =>
        @memoizedMerchantAccount = merchantAccount unless err
        callback(err, @memoizedMerchantAccount)
      )
    else
      callback(null, @memoizedMerchantAccount)

  transactions: (disbursement, callback) ->
    merchant_account_id = disbursement.merchant_account_id
    disbursement_date = disbursement.disbursement_date
    @gateway.transaction.search(((search) ->
      search.merchantAccountId().is(merchant_account_id)
      search.disbursementDate().is(disbursement_date)),
      callback)

exports.DisbursementExceptionGateway = DisbursementExceptionGateway

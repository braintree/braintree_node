{Gateway} = require('./gateway')
{DisbursementException} = require('./disbursement_exception')
exceptions = require('./exceptions')

class DisbursementExceptionGateway extends Gateway
  constructor: (@gateway) ->
    @memoizedMerchantAccount = null

  merchantAccount: (disbursementException, callback) ->
    if (@memoizedMerchantAccount == null)
      @gateway.merchantAccount.find(disbursementException.merchant_account_id, (err, merchantAccount) =>
        @memoizedMerchantAccount = merchantAccount unless err
        callback(err, @memoizedMerchantAccount)
      )
    else
      callback(null, @memoizedMerchantAccount)

  transactions: (disbursementException, callback) ->
    merchant_account_id = disbursementException.merchant_account_id
    disbursement_date = disbursementException.disbursement_date
    @gateway.transaction.search(((search) ->
      search.merchantAccountId().is(merchant_account_id)
      search.disbursementDate().is(disbursement_date)),
      callback)

exports.DisbursementExceptionGateway = DisbursementExceptionGateway

require('../../spec_helper')

braintree = specHelper.braintree
{DisbursementException} = require('../../../lib/braintree/disbursement_exception')

describe "DisbursementExceptionGateway", ->
  describe "merchant_account", ->
    it "retrieves merchant account that owns the disbursement exception", (done) ->
      disbursementExceptionParams =
        merchant_account_id: "sandbox_sub_merchant_account",
        id:  "123456",
        message:  "invalid_account_number",
        amount:  "100.00",
        disbursement_date:  "2014-02-10",
        follow_up_action:  "update"

      disbursementException = new DisbursementException(disbursementExceptionParams)

      specHelper.defaultGateway.disbursementException.merchantAccount(disbursementException, (err, merchantAccount) ->
        assert.isNull(err)
        assert.equal(merchantAccount.id, "sandbox_sub_merchant_account")
        done()
      )

    it "memoizes the merchant account", (done) ->
      disbursementExceptionParams =
        merchant_account_id: "sandbox_sub_merchant_account",
        id:  "123456",
        message:  "invalid_account_number",
        amount:  "100.00",
        disbursement_date:  "2014-02-10",
        follow_up_action:  "update"

      disbursementException = new DisbursementException(disbursementExceptionParams)

      specHelper.defaultGateway.disbursementException.merchantAccount(disbursementException, (err, merchantAccount) ->
        assert.isNull(err)
        firstMerchantAccount = merchantAccount

        disbursementException.merchant_account_id = 'non_existant'
        specHelper.defaultGateway.disbursementException.merchantAccount(disbursementException, (err, merchantAccount) ->
          assert.equal(merchantAccount, firstMerchantAccount)
          done()
        )
      )

  describe "transactions", ->
    it "retrieves transactions associated with the disbursement exception", (done) ->
      disbursementExceptionParams =
        merchant_account_id: "sandbox_sub_merchant_account",
        id:  "123456",
        message:  "invalid_account_number",
        amount:  "100.00",
        disbursement_date:  "2013-04-10",
        follow_up_action:  "update"

      disbursementException = new DisbursementException(disbursementExceptionParams)

      specHelper.defaultGateway.disbursementException.transactions(disbursementException, (err, transactions) ->
        assert.isNull(err)
        assert.equal(transactions.length(), 1)
        transactions.first((err, transaction) ->
          assert.isNull(err)
          assert.equal(transaction.id, "sub_merchant_transaction")
          done())
      )

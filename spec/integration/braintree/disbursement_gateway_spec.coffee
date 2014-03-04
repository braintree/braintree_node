require('../../spec_helper')

braintree = specHelper.braintree
{Disbursement} = require('../../../lib/braintree/disbursement')

describe "DisbursementGateway", ->
  describe "#transactions", ->
    it "retrieves transactions associated with the disbursement", (done) ->
      disbursementParams =
        id: "123456"
        merchantAccount:
          id: "sandbox_sub_merchant_account"
          masterMerchantAccount:
            id: "sandbox_master_merchant_account"
            status: "active"
          status: "active"
        transactionIds: ["sub_merchant_transaction"]
        amount: "100.00"
        disbursementDate: "2013-04-10"
        exceptionMessage: "invalid_account_number"
        followUpAction: "update"
        retry: false
        success: false

      disbursement = new Disbursement(disbursementParams)

      specHelper.defaultGateway.disbursement.transactions(disbursement, (err, transactions) ->
        assert.isNull(err)
        assert.equal(transactions.length(), 1)
        transactions.first((err, transaction) ->
          assert.isNull(err)
          assert.equal(transaction.id, "sub_merchant_transaction")
          done())
      )

require('../../spec_helper')

braintree = specHelper.braintree
{Transfer} = require('../../../lib/braintree/transfer')

describe "Transfer", ->
  describe "merchant_account", ->
    it "retrieves merchant account that owns the transfer", (done) ->
      transferParams =
        merchant_account_id: "sandbox_sub_merchant_account",
        id:  "123456",
        message:  "invalid_account_number",
        amount:  "100.00",
        disbursement_date:  "2014-02-10",
        follow_up_action:  "update"

      transfer = new Transfer(transferParams)

      transfer.merchantAccount(specHelper.defaultGateway, (err, merchantAccount) ->
        assert.isNull(err)
        assert.equal(merchantAccount.id, "sandbox_sub_merchant_account")
        done()
      )

  describe "transactions", ->
    it "retrieves transactions associated with the transfer", (done) ->
      transferParams =
        merchant_account_id: "sandbox_sub_merchant_account",
        id:  "123456",
        message:  "invalid_account_number",
        amount:  "100.00",
        disbursement_date:  "2013-04-10",
        follow_up_action:  "update"

      transfer = new Transfer(transferParams)

      transfer.transactions(specHelper.defaultGateway, (err, transactions) ->
        assert.isNull(err)
        assert.equal(transactions.length(), 1)
        transactions.first((err, transaction) ->
          assert.isNull(err)
          assert.equal(transaction.id, "sub_merchant_transaction")
          done())
      )

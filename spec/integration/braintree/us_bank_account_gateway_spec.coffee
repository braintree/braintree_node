require('../../spec_helper')
{UsBankAccount} = require('../../../lib/braintree/us_bank_account')
{Transaction} = require('../../../lib/braintree/transaction')

describe "UsBankAccountGateway", ->
  describe "find", ->
    it "finds the US bank account", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        specHelper.generateValidUsBankAccountNonce (nonce) ->
          usBankAccountParams =
            customerId: response.customer.id
            paymentMethodNonce: nonce

          specHelper.defaultGateway.paymentMethod.create usBankAccountParams, (err, response) ->
            usBankAccountToken = response.paymentMethod.token
            specHelper.defaultGateway.usBankAccount.find usBankAccountToken, (err, usBankAccount) ->
              assert.isNull(err)
              assert.equal(usBankAccount.last4, "1234")
              assert.equal(usBankAccount.accountDescription, "PayPal Checking - 1234")
              assert.equal(usBankAccount.accountHolderName, "Dan Schulman")
              assert.equal(usBankAccount.routingNumber, "021000021")
              assert.equal(usBankAccount.accountType, "checking")
              assert.match(usBankAccount.bankName, /CHASE/)
              assert.equal(usBankAccount.achMandate.text, "cl mandate text")
              assert.isTrue(usBankAccount.achMandate.acceptedAt instanceof Date)
              assert.isTrue(usBankAccount.default)

              done()

    it "does not find invalid US bank account", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        assert.isTrue(response.success)
        specHelper.defaultGateway.usBankAccount.find specHelper.generateInvalidUsBankAccountNonce(), (err, usBankAccount) ->
          assert.isNull(usBankAccount)
          assert.equal(err.type, "notFoundError")

          done()

  describe "sale", ->
    it "transacts on a US bank account", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        specHelper.generateValidUsBankAccountNonce (nonce) ->
          usBankAccountParams =
            customerId: response.customer.id
            paymentMethodNonce: nonce

          specHelper.defaultGateway.paymentMethod.create usBankAccountParams, (err, response) ->
            transactionParams =
              merchantAccountId: "us_bank_merchant_account"
              amount: "10.00"
            usBankAccountToken = response.paymentMethod.token
            specHelper.defaultGateway.usBankAccount.sale usBankAccountToken, transactionParams, (err, response) ->
              assert.isTrue(response.success)
              assert.equal(response.transaction.status, Transaction.Status.SettlementPending)
              assert.equal(response.transaction.usBankAccount.last4, "1234")
              assert.equal(response.transaction.usBankAccount.accountDescription, "PayPal Checking - 1234")
              assert.equal(response.transaction.usBankAccount.accountHolderName, "Dan Schulman")
              assert.equal(response.transaction.usBankAccount.routingNumber, "021000021")
              assert.equal(response.transaction.usBankAccount.accountType, "checking")
              assert.match(response.transaction.usBankAccount.bankName, /CHASE/)
              assert.equal(response.transaction.usBankAccount.achMandate.text, "cl mandate text")
              assert.isTrue(response.transaction.usBankAccount.achMandate.acceptedAt instanceof Date)

              done()

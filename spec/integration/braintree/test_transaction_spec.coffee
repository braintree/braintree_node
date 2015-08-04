require('../../spec_helper')

braintree = specHelper.braintree
{Transaction} = require('../../../lib/braintree/transaction')
{TestTransaction} = require('../../../lib/braintree/test_transaction')
{Environment} = require('../../../lib/braintree/environment')

describe "TestTransaction", ->
  describe "test settlement methods", ->
    it "settles a test transaction", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          submitForSettlement: true

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.transaction.status, 'submitted_for_settlement')
        testTransaction = new TestTransaction()
        testTransaction.settle specHelper.defaultGateway, response.transaction.id, (err, response) ->
          assert.isNull(err)
          assert.equal(response.transaction.status, 'settled')

          done()

    it "marks a test transaction settlement pending", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          submitForSettlement: true

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.transaction.status, 'submitted_for_settlement')
        testTransaction = new TestTransaction()
        testTransaction.settlementPending specHelper.defaultGateway, response.transaction.id, (err, response) ->
          assert.isNull(err)
          assert.equal(response.transaction.status, 'settlement_pending')

          done()

    it "marks a test transaction settlement confirmed", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          submitForSettlement: true

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.transaction.status, 'submitted_for_settlement')
        testTransaction = new TestTransaction()
        testTransaction.settlementConfirm specHelper.defaultGateway, response.transaction.id, (err, response) ->
          assert.isNull(err)
          assert.equal(response.transaction.status, 'settlement_confirmed')

          done()

    it "marks a test transaction settlement declined", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          submitForSettlement: true

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.transaction.status, 'submitted_for_settlement')
        testTransaction = new TestTransaction()
        testTransaction.settlementDecline specHelper.defaultGateway, response.transaction.id, (err, response) ->
          assert.isNull(err)
          assert.equal(response.transaction.status, 'settlement_declined')

          done()

    it "throws an error if test transaction settlement methods are used in production", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          submitForSettlement: true

      gatewayConfig = {
        environment: Environment.Production
        merchantId: 'integration_merchant_id'
        publicKey: 'integration_public_key'
        privateKey: 'integration_private_key'
      }

      gateway = braintree.connect(gatewayConfig)
      testTransaction = new TestTransaction()
      testTransaction.settle gateway, 'transaction_id', (err, response) ->
        assert.equal(err.type, braintree.errorTypes.testOperationPerformedInProductionError)

        done()
      

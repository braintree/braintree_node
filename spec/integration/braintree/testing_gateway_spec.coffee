require('../../spec_helper')

braintree = specHelper.braintree
{Transaction} = require('../../../lib/braintree/transaction')
{Environment} = require('../../../lib/braintree/environment')

describe "TestingGateway", ->
  describe "test settlement methods", ->
    it "settles a transaction", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          submitForSettlement: true

      specHelper.defaultGateway.transaction.sale transactionParams, (err, transactionResponse) ->
        assert.isNull(err)
        assert.isTrue(transactionResponse.success)
        assert.equal(transactionResponse.transaction.status, 'submitted_for_settlement')
        specHelper.defaultGateway.testing.settle transactionResponse.transaction.id, (err, settleResponse) ->
          assert.isNull(err)
          assert.equal(settleResponse.transaction.status, 'settled')

          done()

    it "marks a transaction settlement pending", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          submitForSettlement: true

      specHelper.defaultGateway.transaction.sale transactionParams, (err, transactionResponse) ->
        assert.isNull(err)
        assert.isTrue(transactionResponse.success)
        assert.equal(transactionResponse.transaction.status, 'submitted_for_settlement')
        specHelper.defaultGateway.testing.settlementPending transactionResponse.transaction.id, (err, settleResponse) ->
          assert.isNull(err)
          assert.equal(settleResponse.transaction.status, 'settlement_pending')

          done()

    it "marks a transaction settlement confirmed", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          submitForSettlement: true

      specHelper.defaultGateway.transaction.sale transactionParams, (err, transactionResponse) ->
        assert.isNull(err)
        assert.isTrue(transactionResponse.success)
        assert.equal(transactionResponse.transaction.status, 'submitted_for_settlement')
        specHelper.defaultGateway.testing.settlementConfirm transactionResponse.transaction.id, (err, settleResponse) ->
          assert.isNull(err)
          assert.equal(settleResponse.transaction.status, 'settlement_confirmed')

          done()

    it "marks a transaction settlement declined", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          submitForSettlement: true

      specHelper.defaultGateway.transaction.sale transactionParams, (err, transactionResponse) ->
        assert.isNull(err)
        assert.isTrue(transactionResponse.success)
        assert.equal(transactionResponse.transaction.status, 'submitted_for_settlement')
        specHelper.defaultGateway.testing.settlementDecline transactionResponse.transaction.id, (err, settleResponse) ->
          assert.isNull(err)
          assert.equal(settleResponse.transaction.status, 'settlement_declined')

          done()

    it "throws an error if testing gateway settlement methods are used in production", (done) ->
      gatewayConfig = {
        environment: Environment.Production
        merchantId: 'integration_merchant_id'
        publicKey: 'integration_public_key'
        privateKey: 'integration_private_key'
      }

      gateway = braintree.connect(gatewayConfig)
      gateway.testing.settlementConfirm 'transaction_id', (err, transactionResponse) ->
        assert.equal(err.type, braintree.errorTypes.testOperationPerformedInProductionError)

        done()


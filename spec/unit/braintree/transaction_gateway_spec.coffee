require('../../spec_helper')
{TransactionGateway} = require('../../../lib/braintree/transaction_gateway')

describe "TransactionGateway", ->
  describe "sale", ->
    fakeGateway =
      config:
        baseMerchantPath: ->
          ""
      http:
        post: (url, params, callback) ->
          callback(params)

    it 'accepts skip_advanced_fraud_checking options', (done) ->
      transactionGateway = new TransactionGateway(fakeGateway)
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          skipAdvancedFraudChecking: true

      assertRequestBody = (params) ->
        assert.isTrue(params.transaction.options.skipAdvancedFraudChecking)

      paymentMethod = transactionGateway.sale(transactionParams, assertRequestBody)
      done()

    it 'does not include skip_advanced_fraud_checking in params if its not specified', (done) ->
      transactionGateway = new TransactionGateway(fakeGateway)
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          submitForSettlement: true

      assertRequestBody = (params) ->
        assert.isFalse(params.transaction.options.skipAdvancedFraudChecking?)

      paymentMethod = transactionGateway.sale(transactionParams, assertRequestBody)
      done()

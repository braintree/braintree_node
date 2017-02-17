'use strict';

require('../../spec_helper');
let TransactionGateway = require('../../../lib/braintree/transaction_gateway').TransactionGateway;

describe("TransactionGateway", () =>
  describe("sale", function() {
    let fakeGateway = {
      config: {
        baseMerchantPath() {
          return "";
        }
      },
      http: {
        post(url, params, callback) {
          return callback(params);
        }
      }
    };

    it('accepts skip_advanced_fraud_checking options', function(done) {
      let transactionGateway = new TransactionGateway(fakeGateway);
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          skipAdvancedFraudChecking: true
        }
      };

      let assertRequestBody = params => assert.isTrue(params.transaction.options.skipAdvancedFraudChecking);

      let paymentMethod = transactionGateway.sale(transactionParams, assertRequestBody);
      return done();
    });

    return it('does not include skip_advanced_fraud_checking in params if its not specified', function(done) {
      let transactionGateway = new TransactionGateway(fakeGateway);
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      let assertRequestBody = params => assert.isFalse(params.transaction.options.skipAdvancedFraudChecking != null);

      let paymentMethod = transactionGateway.sale(transactionParams, assertRequestBody);
      return done();
    });
  })
);

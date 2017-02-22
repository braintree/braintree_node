'use strict';

let TransactionGateway = require('../../../lib/braintree/transaction_gateway').TransactionGateway;

describe('TransactionGateway', () =>
  describe('sale', function () {
    let fakeGateway = {
      config: {
        baseMerchantPath() {
          return '';
        }
      },
      http: {
        post(url, params, callback) {
          callback(params);
        }
      }
    };

    it('accepts skip_advanced_fraud_checking options', function (done) {
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

      let assertRequestBody = params => assert.isTrue(params.transaction.options.skipAdvancedFraudChecking); // eslint-disable-line func-style

      transactionGateway.sale(transactionParams, assertRequestBody);

      done();
    });

    it('does not include skip_advanced_fraud_checking in params if its not specified', function (done) {
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

      let assertRequestBody = params => assert.isFalse(params.transaction.options.skipAdvancedFraudChecking != null); // eslint-disable-line func-style

      transactionGateway.sale(transactionParams, assertRequestBody);

      done();
    });
  })
);

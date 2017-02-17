'use strict';

require('../../spec_helper');

let braintree = specHelper.braintree;
let Transaction = require('../../../lib/braintree/transaction').Transaction;
let Environment = require('../../../lib/braintree/environment').Environment;

describe("TestingGateway", () =>
  describe("test settlement methods", function() {
    it("settles a transaction", function(done) {
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

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, transactionResponse) {
        assert.isNull(err);
        assert.isTrue(transactionResponse.success);
        assert.equal(transactionResponse.transaction.status, 'submitted_for_settlement');
        return specHelper.defaultGateway.testing.settle(transactionResponse.transaction.id, function(err, settleResponse) {
          assert.isNull(err);
          assert.equal(settleResponse.transaction.status, 'settled');

          return done();
        });
      });
    });

    it("marks a transaction settlement pending", function(done) {
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

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, transactionResponse) {
        assert.isNull(err);
        assert.isTrue(transactionResponse.success);
        assert.equal(transactionResponse.transaction.status, 'submitted_for_settlement');
        return specHelper.defaultGateway.testing.settlementPending(transactionResponse.transaction.id, function(err, settleResponse) {
          assert.isNull(err);
          assert.equal(settleResponse.transaction.status, 'settlement_pending');

          return done();
        });
      });
    });

    it("marks a transaction settlement confirmed", function(done) {
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

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, transactionResponse) {
        assert.isNull(err);
        assert.isTrue(transactionResponse.success);
        assert.equal(transactionResponse.transaction.status, 'submitted_for_settlement');
        return specHelper.defaultGateway.testing.settlementConfirm(transactionResponse.transaction.id, function(err, settleResponse) {
          assert.isNull(err);
          assert.equal(settleResponse.transaction.status, 'settlement_confirmed');

          return done();
        });
      });
    });

    it("marks a transaction settlement declined", function(done) {
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

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, transactionResponse) {
        assert.isNull(err);
        assert.isTrue(transactionResponse.success);
        assert.equal(transactionResponse.transaction.status, 'submitted_for_settlement');
        return specHelper.defaultGateway.testing.settlementDecline(transactionResponse.transaction.id, function(err, settleResponse) {
          assert.isNull(err);
          assert.equal(settleResponse.transaction.status, 'settlement_declined');

          return done();
        });
      });
    });

    return it("throws an error if testing gateway settlement methods are used in production", function(done) {
      let gatewayConfig = {
        environment: Environment.Production,
        merchantId: 'integration_merchant_id',
        publicKey: 'integration_public_key',
        privateKey: 'integration_private_key'
      };

      let gateway = braintree.connect(gatewayConfig);
      return gateway.testing.settlementConfirm('transaction_id', function(err, transactionResponse) {
        assert.equal(err.type, braintree.errorTypes.testOperationPerformedInProductionError);

        return done();
      });
    });
  })
);


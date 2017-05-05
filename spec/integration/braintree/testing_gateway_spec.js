'use strict';

let braintree = specHelper.braintree;
let Environment = require('../../../lib/braintree/environment').Environment;

describe('TestingGateway', () =>
  describe('test settlement methods', function () {
    it('settles a transaction', function (done) {
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

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, transactionResponse) {
        assert.isNull(err);
        assert.isTrue(transactionResponse.success);
        assert.equal(transactionResponse.transaction.status, 'submitted_for_settlement');
        specHelper.defaultGateway.testing.settle(transactionResponse.transaction.id, function (err, settleResponse) {
          assert.isNull(err);
          assert.equal(settleResponse.transaction.status, 'settled');

          done();
        });
      });
    });

    it('marks a transaction settlement pending', function (done) {
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

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, transactionResponse) {
        assert.isNull(err);
        assert.isTrue(transactionResponse.success);
        assert.equal(transactionResponse.transaction.status, 'submitted_for_settlement');
        specHelper.defaultGateway.testing.settlementPending(transactionResponse.transaction.id, function (err, settleResponse) {
          assert.isNull(err);
          assert.equal(settleResponse.transaction.status, 'settlement_pending');

          done();
        });
      });
    });

    it('marks a transaction settlement confirmed', function (done) {
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

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, transactionResponse) {
        assert.isNull(err);
        assert.isTrue(transactionResponse.success);
        assert.equal(transactionResponse.transaction.status, 'submitted_for_settlement');
        specHelper.defaultGateway.testing.settlementConfirm(transactionResponse.transaction.id, function (err, settleResponse) {
          assert.isNull(err);
          assert.equal(settleResponse.transaction.status, 'settlement_confirmed');

          done();
        });
      });
    });

    it('marks a transaction settlement declined', function (done) {
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

      specHelper.defaultGateway.transaction.sale(transactionParams, function (err, transactionResponse) {
        assert.isNull(err);
        assert.isTrue(transactionResponse.success);
        assert.equal(transactionResponse.transaction.status, 'submitted_for_settlement');
        specHelper.defaultGateway.testing.settlementDecline(transactionResponse.transaction.id, function (err, settleResponse) {
          assert.isNull(err);
          assert.equal(settleResponse.transaction.status, 'settlement_declined');

          done();
        });
      });
    });

    it('throws an error if testing gateway settlement methods are used in production', function (done) {
      let gatewayConfig = {
        environment: Environment.Production,
        merchantId: 'integration_merchant_id',
        publicKey: 'integration_public_key',
        privateKey: 'integration_private_key'
      };

      let gateway = braintree.connect(gatewayConfig);

      gateway.testing.settlementConfirm('transaction_id', function (err) {
        assert.equal(err.type, braintree.errorTypes.testOperationPerformedInProductionError);

        done();
      });
    });
  })
);


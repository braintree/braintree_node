'use strict';

let Transaction = require('../../../lib/braintree/transaction').Transaction;

describe('IdealPaymentGateway', function () {
  describe('sale', () => {
    it('transacts on an Ideal payment nonce', done => {
      specHelper.generateValidIdealPaymentNonce(function (nonce) {
        let transactionParams = {
          merchantAccountId: 'ideal_merchant_account',
          orderId: 'ABC123',
          amount: '100.00'
        };

        specHelper.defaultGateway.idealPayment.sale(nonce, transactionParams, function (err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, Transaction.Status.Settled);
          assert.match(response.transaction.idealPaymentDetails.idealPaymentId, /^idealpayment_\w{6,}$/);
          assert.match(response.transaction.idealPaymentDetails.idealTransactionId, /^\d{16,}$/);
          assert.isTrue(response.transaction.idealPaymentDetails.imageUrl.startsWith('https://'));
          assert.isNotNull(response.transaction.idealPaymentDetails.maskedIban);
          assert.isNotNull(response.transaction.idealPaymentDetails.bic);

          done();
        });
      })
    });

    it('fails with an invalid nonce', done => {
      let transactionParams = {
        merchantAccountId: 'ideal_merchant_account',
        orderId: 'ABC123',
        amount: '100.00'
      };

      specHelper.defaultGateway.idealPayment.sale("invalid nonce", transactionParams, function (err, response) {
        assert.isFalse(response.success);

        done();
      });
    });
  });
});

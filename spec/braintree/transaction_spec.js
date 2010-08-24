require('../spec_helper');
var braintree = require('../../lib/braintree');

vows.describe('Transaction').addBatch({
  'create': {
    'for a minimal case': {
      topic: function () {
        var gateway = braintree.connect({
          environment: braintree.Environment.Development,
          merchantId: 'integration_merchant_id',
          publicKey: 'integration_public_key',
          privateKey: 'integration_private_key'
        });
        gateway.transaction.sale({
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/12'
          }
        }, this.callback);
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'is succesful': function (err, response) { assert.equal(response.success, true); },
      'is a sale': function (err, response) { assert.equal(response.transaction.type, 'sale'); },
      'is for 5.00': function (err, response) { assert.equal(response.transaction.amount, '5.00'); },
      'has a masked number of 510510******5100': function (err, response) {
        assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100');
      }
    },

    'when processor declined': {
      topic: function () {
        var gateway = braintree.connect({
          environment: braintree.Environment.Development,
          merchantId: 'integration_merchant_id',
          publicKey: 'integration_public_key',
          privateKey: 'integration_private_key'
        });
        gateway.transaction.sale({
          amount: '2000.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/12'
          }
        }, this.callback);
      },
      'is unsuccessful': function (err, response) { assert.equal(response.success, false); },
      'has a transaction': function (err, response) {
        assert.equal(response.transaction.amount, '2000.00');
      },
      'has a status of processor_declined': function (err, response) {
        assert.equal(response.transaction.status, 'processor_declined');
      }
    },

    'with errors': {
      topic: function () {
        var gateway = braintree.connect({
          environment: braintree.Environment.Development,
          merchantId: 'integration_merchant_id',
          publicKey: 'integration_public_key',
          privateKey: 'integration_private_key'
        });
        gateway.transaction.sale({
          creditCard: {
            number: '5105105105105100'
          }
        }, this.callback);
      },
      'is unsuccessful': function (err, response) { assert.equal(response.success, false); },
      'has a unified message': function (err, response) {
        assert.equal(response.message, 'Amount is required.\nExpiration date is required.');
      },
      'has an error on amount': function (err, response) {
        assert.equal(
          response.errors.for('transaction').on('amount').code,
          '81502'
        );
      },
      'has an attribute on ValidationError objects': function (err, response) {
        assert.equal(
          response.errors.for('transaction').on('amount').attribute,
          'amount'
        );
      },
      'has a nested error on creditCard.expirationDate': function (err, response) {
        assert.equal(
          response.errors.for('transaction').for('creditCard').on('expirationDate').code,
          '81709'
        );
      },
      'returns deepErrors': function (err, response) {
        var errorCodes = _.map(response.errors.deepErrors(), function (error) { return error.code; });
        assert.equal(2, errorCodes.length);
        assert.include(errorCodes, '81502');
        assert.include(errorCodes, '81709');
      }
    }
  }
}).export(module);

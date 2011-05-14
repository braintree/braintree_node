require('../spec_helper');

var _ = require('underscore')._;

vows.describe('TransactionGateway').addBatch({
  'credit': {
    'for a minimal case': {
      topic: function () {
        specHelper.defaultGateway.transaction.credit({
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/12'
          }
        }, this.callback);
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'is succesful': function (err, response) { assert.equal(response.success, true); },
      'is a credit': function (err, response) { assert.equal(response.transaction.type, 'credit'); },
      'is for 5.00': function (err, response) { assert.equal(response.transaction.amount, '5.00'); },
      'has a masked number of 510510******5100': function (err, response) {
        assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100');
      }
    },

    'with errors': {
      topic: function () {
        specHelper.defaultGateway.transaction.credit({
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
  },

  'sale': {
    'for a minimal case': {
      topic: function () {
        specHelper.defaultGateway.transaction.sale({
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

    'with a custom field': {
      topic: function () {
        specHelper.defaultGateway.transaction.sale({
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/12'
          },
          customFields: {
            storeMe: 'custom value'
          }
        }, this.callback);
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'is succesful': function (err, response) { assert.equal(response.success, true); },
      'has custom fields in response': function (err, response) {
        assert.equal(response.transaction.customFields.storeMe, 'custom value');
      }
    },

    'when processor declined': {
      topic: function () {
        specHelper.defaultGateway.transaction.sale({
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
        specHelper.defaultGateway.transaction.sale({
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
  },

  'find': {
    'when found': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.transaction.sale(
          {
            amount: '5.00',
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/12'
            }
          },
          function (err, response) {
            specHelper.defaultGateway.transaction.find(response.transaction.id, callback);
          }
        );
      },
      'returns transaction details': function (err, transaction) {
        assert.equal('5.00', transaction.amount);
      }
    },

    'when not found': {
      topic: function () {
        specHelper.defaultGateway.transaction.find('nonexistent_transaction', this.callback);
      },
      'returns a not found error': function (err, response) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);
      }
    },
  },

  'submitForSettlement': {
    'when submitting an authorized transaction for settlement': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.transaction.sale(
          {
            amount: '5.00',
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/12'
            }
          },
          function (err, response) {
            specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, callback);
          }
        )
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'is succesful': function (err, response) { assert.equal(response.success, true); },
      'sets the status to submitted_for_settlement': function (err, response) { assert.equal(response.transaction.status, 'submitted_for_settlement'); },
    },

    'when transaction cannot be submitted for settlement': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.transaction.sale(
          {
            amount: '5.00',
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/12'
            },
            options: {
              submitForSettlement: true
            }
          },
          function (err, response) {
            specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, callback);
          }
        )
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'is not succesful': function (err, response) { assert.equal(response.success, false); },
      'has error 91507 on base': function (err, response) {
        assert.equal(response.errors.for('transaction').on('base').code, '91507');
      }
    }
  },

  'void': {
    'when voiding an authorized transaction': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.transaction.sale(
          {
            amount: '5.00',
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/12'
            }
          },
          function (err, response) {
            specHelper.defaultGateway.transaction.void(response.transaction.id, callback);
          }
        )
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'is succesful': function (err, response) { assert.equal(response.success, true); },
      'sets the status to voided': function (err, response) { assert.equal(response.transaction.status, 'voided'); },
    },

    'when transaction cannot be voided': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.transaction.sale(
          {
            amount: '5.00',
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/12'
            }
          },
          function (err, response) {
            specHelper.defaultGateway.transaction.void(response.transaction.id, function (err, response) {
              specHelper.defaultGateway.transaction.void(response.transaction.id, callback);
            });
          }
        )
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'is not succesful': function (err, response) { assert.equal(response.success, false); },
      'has error 91504 on base': function (err, response) {
        assert.equal(response.errors.for('transaction').on('base').code, '91504');
      }
    }
  }
}).export(module);

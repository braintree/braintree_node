require('../spec_helper');

var _ = require('underscore')._;

vows.describe('CreditCardGateway').addBatch({
  'create': {
    'for a minimal case': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {
            firstName: 'John',
            lastName: 'Smith'
          },
          function (err, response) {
            specHelper.defaultGateway.creditCard.create({
              customerId: response.customer.id,
              number: '5105105105105100',
              expirationDate: '05/2012'
            }, callback);
          }
        );
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'is succesful': function (err, response) { assert.equal(response.success, true); },
      'has credit card attributes': function (err, response) {
        assert.equal(response.creditCard.maskedNumber, '510510******5100');
        assert.equal(response.creditCard.expirationDate, '05/2012');
      }
    },

    'with errors': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {
            firstName: 'John',
            lastName: 'Smith'
          },
          function (err, response) {
            specHelper.defaultGateway.creditCard.create({
              customerId: response.customer.id,
              number: 'invalid',
              expirationDate: '05/2012'
            }, callback);
          }
        );
      },
      'is unsuccessful': function (err, response) { assert.equal(response.success, false); },
      'has a unified message': function (err, response) {
        assert.equal(response.message, 'Credit card number must be 12-19 digits.');
      },
      'has an error on number': function (err, response) {
        assert.equal(
          response.errors.for('creditCard').on('number').code,
          '81716'
        );
      },
      'has an attribute on ValidationError objects': function (err, response) {
        assert.equal(
          response.errors.for('creditCard').on('number').attribute,
          'number'
        );
      },
      'returns deepErrors': function (err, response) {
        var errorCodes = _.map(response.errors.deepErrors(), function (error) { return error.code; });
        assert.equal(1, errorCodes.length);
        assert.include(errorCodes, '81716');
      }
    }
  },

}).export(module);

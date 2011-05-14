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

  'delete': {
    'the delete response': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/2014'
            }
          },
          function (err, response) {
            specHelper.defaultGateway.creditCard.delete(
              response.customer.creditCards[0].token, callback
            );
          }
        );
      },
      'does not have an error': function (err) { assert.isNull(err); },
    },

    'deletes the creditCard': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/2014'
            }
          },
          function (err, response) {
            specHelper.defaultGateway.creditCard.delete(
              response.customer.creditCards[0].token,
              function (err) {
                specHelper.defaultGateway.creditCard.find(
                  response.customer.creditCards[0].token, callback
                );
              }
            );
          }
        );
      },
      'returning a not found error': function (err, response) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);
      }
    },

    'when the credit card cannot be found': {
      topic: function () {
        specHelper.defaultGateway.creditCard.delete('nonexistent_token', this.callback);
      },
      'returns a not found error': function (err, response) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);
      }
    },
  },

  'find': {
    'when found': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/2014'
            }
          },
          function (err, response) {
            specHelper.defaultGateway.creditCard.find(
              response.customer.creditCards[0].token,
              callback
            );
          }
        );
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'returns credit card details': function (err, creditCard) {
        assert.equal(creditCard.maskedNumber, '510510******5100');
        assert.equal(creditCard.expirationDate, '05/2014');
      }
    },

    'when not found': {
      topic: function () {
        specHelper.defaultGateway.creditCard.find('nonexistent_token', this.callback);
      },
      'returns a not found error': function (err, response) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);
      }
    },
  },

  'update': {
    'for a minimal case': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {
            creditCard: {
              cardholderName: 'Old Cardholder Name',
              number: '5105105105105100',
              expirationDate: '05/2014'
            }
          },
          function (err, response) {
            specHelper.defaultGateway.creditCard.update(
              response.customer.creditCards[0].token,
              {
                cardholderName: 'New Cardholder Name',
                number: '4111111111111111',
                expirationDate: '12/2015'
              },
              callback
            );
          }
        );
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'is succesful': function (err, response) { assert.equal(response.success, true); },
      'has updated credit card attributes': function (err, response) {
        assert.equal(response.creditCard.cardholderName, 'New Cardholder Name');
        assert.equal(response.creditCard.maskedNumber, '411111******1111');
        assert.equal(response.creditCard.expirationDate, '12/2015');
      }
    },

    'with errors': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/2014'
            }
          },
          function (err, response) {
            specHelper.defaultGateway.creditCard.update(
              response.customer.creditCards[0].token,
              {
                number: 'invalid'
              },
              callback
            );
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

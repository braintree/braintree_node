require('../spec_helper');

var _ = require('underscore')._;

vows.describe('CustomerGateway').addBatch({
  'create': {
    'for a minimal case': {
      topic: function () {
        specHelper.defaultGateway.customer.create({
          firstName: 'John',
          lastName: 'Smith'
        }, this.callback);
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'is succesful': function (err, response) { assert.equal(response.success, true); },
      'has customer attributes': function (err, response) {
        assert.equal(response.customer.firstName, 'John');
        assert.equal(response.customer.lastName, 'Smith');
      }
    },

    'with a custom field': {
      topic: function () {
        specHelper.defaultGateway.customer.create({
          customFields: {
            storeMe: 'custom value'
          }
        }, this.callback);
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'is succesful': function (err, response) { assert.equal(response.success, true); },
      'has custom fields in response': function (err, response) {
        assert.equal(response.customer.customFields.storeMe, 'custom value');
      }
    },

    'with credit card': {
      topic: function () {
        specHelper.defaultGateway.customer.create({
          firstName: 'John',
          lastName: 'Smith',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2012'
          }
        }, this.callback);
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'is succesful': function (err, response) { assert.equal(response.success, true); },
      'has customer attributes': function (err, response) {
        assert.equal(response.customer.firstName, 'John');
        assert.equal(response.customer.lastName, 'Smith');
      },
      'has credit card attributes': function (err, response) {
        assert.equal(response.customer.creditCards.length, 1);
        assert.equal(response.customer.creditCards[0].expirationMonth, '05');
        assert.equal(response.customer.creditCards[0].expirationYear, '2012');
        assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100');
      }
    },

    'with credit card with errors': {
      topic: function () {
        specHelper.defaultGateway.customer.create({
          creditCard: {
            number: 'invalid card number',
            expirationDate: '05/2012'
          }
        }, this.callback);
      },
      'is unsuccessful': function (err, response) { assert.equal(response.success, false); },
      'has a unified message': function (err, response) {
        assert.equal(response.message, 'Credit card number is invalid.');
      },
      'has a nested error on creditCard.number': function (err, response) {
        assert.equal(
          response.errors.for('customer').for('creditCard').on('number').code,
          '81715'
        );
      },
      'returns deepErrors': function (err, response) {
        var errorCodes = _.map(response.errors.deepErrors(), function (error) { return error.code; });
        assert.equal(errorCodes.length, 1);
        assert.include(errorCodes, '81715');
      }
    },

    'with credit card and billing address': {
      topic: function () {
        specHelper.defaultGateway.customer.create({
          firstName: 'John',
          lastName: 'Smith',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2012',
            billingAddress: {
              streetAddress: '123 Fake St',
              extendedAddress: 'Suite 403',
              locality: 'Chicago',
              region: 'IL',
              postalCode: '60607',
              countryName: 'United States of America'
            }
          }
        }, this.callback);
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'is succesful': function (err, response) { assert.equal(response.success, true); },
      'has customer attributes': function (err, response) {
        assert.equal(response.customer.firstName, 'John');
        assert.equal(response.customer.lastName, 'Smith');
      },
      'has credit card attributes': function (err, response) {
        assert.equal(response.customer.creditCards.length, 1);
        assert.equal(response.customer.creditCards[0].expirationMonth, '05');
        assert.equal(response.customer.creditCards[0].expirationYear, '2012');
        assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100');
      },
      'has billing address attributes': function (err, response) {
        assert.equal(response.customer.creditCards.length, 1);
        var billingAddress = response.customer.creditCards[0].billingAddress;
        assert.equal(billingAddress.streetAddress, '123 Fake St');
        assert.equal(billingAddress.extendedAddress, 'Suite 403');
        assert.equal(billingAddress.locality, 'Chicago');
        assert.equal(billingAddress.region, 'IL');
        assert.equal(billingAddress.postalCode, '60607');
        assert.equal(billingAddress.countryName, 'United States of America');
      }
    },

    'with credit card and billing address with errors': {
      topic: function () {
        specHelper.defaultGateway.customer.create({
          creditCard: {
            number: 'invalid card number',
            expirationDate: '05/2012',
            billingAddress: {
              countryName: 'invalid country'
            }
          }
        }, this.callback);
      },
      'is unsuccessful': function (err, response) { assert.equal(response.success, false); },
      'has a unified message': function (err, response) {
        assert.equal(response.message, 'Credit card number is invalid.\nCountry name is not an accepted country.');
      },
      'has a nested error on creditCard.number': function (err, response) {
        assert.equal(
          response.errors.for('customer').for('creditCard').on('number').code,
          '81715'
        );
      },
      'has a nested error on creditCard.billingAddress.countryName': function (err, response) {
        assert.equal(
          response.errors.for('customer').for('creditCard').for('billingAddress').on('countryName').code,
          '91803'
        );
      },
      'returns deepErrors': function (err, response) {
        var errorCodes = _.map(response.errors.deepErrors(), function (error) { return error.code; });
        assert.equal(errorCodes.length, 2);
        assert.include(errorCodes, '81715');
        assert.include(errorCodes, '91803');
      }
    },


    'with errors': {
      topic: function () {
        specHelper.defaultGateway.customer.create({
          email: 'invalid_email_address'
        }, this.callback);
      },
      'is unsuccessful': function (err, response) { assert.equal(response.success, false); },
      'has a unified message': function (err, response) {
        assert.equal(response.message, 'Email is an invalid format.');
      },
      'has an error on email': function (err, response) {
        assert.equal(
          response.errors.for('customer').on('email').code,
          '81604'
        );
      },
      'has an attribute on ValidationError objects': function (err, response) {
        assert.equal(
          response.errors.for('customer').on('email').attribute,
          'email'
        );
      },
      'returns deepErrors': function (err, response) {
        var errorCodes = _.map(response.errors.deepErrors(), function (error) { return error.code; });
        assert.equal(1, errorCodes.length);
        assert.include(errorCodes, '81604');
      }
    }
  },

  'delete': {
    'the delete response': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {},
          function (err, response) {
            specHelper.defaultGateway.customer.delete(response.customer.id, callback);
          }
        );
      },
      'does not have an error': function (err) { assert.isNull(err); },
    },

    'deletes the customer': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {},
          function (err, response) {
            specHelper.defaultGateway.customer.delete(
              response.customer.id,
              function (err) {
                specHelper.defaultGateway.customer.find(response.customer.id, callback);
              }
            );
          }
        );
      },
      'returning a not found error': function (err, response) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);
      }
    },

    'when customer cannot be found': {
      topic: function () {
        specHelper.defaultGateway.customer.delete('nonexistent_customer', this.callback);
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
            firstName: 'John',
            lastName: 'Smith'
          },
          function (err, response) {
            specHelper.defaultGateway.customer.find(response.customer.id, callback);
          }
        );
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'returns customer details': function (err, customer) {
        assert.equal(customer.firstName, 'John');
        assert.equal(customer.lastName, 'Smith');
      }
    },

    'when not found': {
      topic: function () {
        specHelper.defaultGateway.customer.find('nonexistent_customer', this.callback);
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
            firstName: 'Old First Name',
            lastName: 'Old Last Name'
          },
          function (err, response) {
            specHelper.defaultGateway.customer.update(
              response.customer.id,
              {
                firstName: 'New First Name',
                lastName: 'New Last Name'
              },
              callback
            )
          }
        );
      },
      'does not have an error': function (err, response) { assert.isNull(err); },
      'is succesful': function (err, response) { assert.equal(response.success, true); },
      'has updated customer attributes': function (err, response) {
        assert.equal(response.customer.firstName, 'New First Name');
        assert.equal(response.customer.lastName, 'New Last Name');
      }
    },

    'when not found': {
      topic: function () {
        specHelper.defaultGateway.customer.update('nonexistent_customer', {}, this.callback);
      },
      'returns a not found error': function (err, response) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);
      }
    },

    'with errors': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {},
          function (err, response) {
            specHelper.defaultGateway.customer.update(
              response.customer.id,
              {
                email: 'invalid_email_address'
              },
              callback
            )
          }
        );
      },
      'is unsuccessful': function (err, response) { assert.equal(response.success, false); },
      'has a unified message': function (err, response) {
        assert.equal(response.message, 'Email is an invalid format.');
      },
      'has an error on email': function (err, response) {
        assert.equal(
          response.errors.for('customer').on('email').code,
          '81604'
        );
      },
      'has an attribute on ValidationError objects': function (err, response) {
        assert.equal(
          response.errors.for('customer').on('email').attribute,
          'email'
        );
      }
    }
  },
}).export(module);

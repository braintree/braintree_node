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
}).export(module);

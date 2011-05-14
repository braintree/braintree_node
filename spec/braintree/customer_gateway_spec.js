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
  }
}).export(module);

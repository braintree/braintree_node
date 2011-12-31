require('../spec_helper');

var braintree = specHelper.braintree;

vows.describe('Braintree').addBatch({
  'AuthenticationError': {
    'for invalid credentials': {
      topic: function () {
        var gateway = specHelper.braintree.connect({
          environment: specHelper.braintree.Environment.Development,
          merchantId: 'invalid',
          publicKey: 'invalid',
          privateKey: 'invalid'
        });
        gateway.transaction.sale({}, this.callback);
      },
      'returns the AuthenticationError': function (err, response) {
        assert.equal(err.type, braintree.errorTypes.authenticationError);
      }
    }
  }
}).export(module);


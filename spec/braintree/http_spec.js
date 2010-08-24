require('../spec_helper');
var braintree = require('../../lib/braintree');
var Config = require('../../lib/braintree/config').Config;
var Http = require('../../lib/braintree/http').Http;

vows.describe('Http').addBatch({
  'UnexpectedError': {
    topic: function () {
      var config = Config({
        environment: braintree.Environment.Development,
        merchantId: 'integration_merchant_id',
        publicKey: 'integration_public_key',
        privateKey: 'integration_private_key'
      });
      var http = Http(config);
      http.post('/test/error', '', this.callback);
    },
    'returns the UnexpectedError': function (err, response) {
      assert.equal(err.type, braintree.errorTypes.unexpectedError);
    }
  }
}).export(module);

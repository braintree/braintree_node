require('../spec_helper');
var Config = require('../../lib/braintree/config').Config;
var Http = require('../../lib/braintree/http').Http;

vows.describe('Http').addBatch({
  'request': {
    'when the http response status is 500': {
      topic: function () {
        var http = Http(Config(specHelper.defaultConfig));
        http.post('/test/error', '', this.callback);
      },
      'returns a ServerError': function (err, response) {
        assert.equal(err.type, braintree.errorTypes.serverError);
      }
    },

    'can hit the sandbox': {
      topic: function () {
        var http = Http(Config({
          environment: braintree.Environment.Sandbox,
          merchantId: 'node',
          publicKey: 'node',
          privateKey: 'node'
        }));
        http.get('/not_found', this.callback);
      },
      'gets a not found errors': function (err, response) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);
      }
    }
  },

  'can hit production': {
    topic: function () {
      var http = Http(Config({
        environment: braintree.Environment.Production,
        merchantId: 'node',
        publicKey: 'node',
        privateKey: 'node'
      }));
      http.get('/not_found', this.callback);
    },
    'gets a not found errors': function (err, response) {
      assert.equal(err.type, braintree.errorTypes.notFoundError);
    }
  }

}).export(module);

require('../spec_helper');
var Config = require('../../lib/braintree/config').Config;
var Http = require('../../lib/braintree/http').Http;

vows.describe('Http').addBatch({
  'UnexpectedError': {
    topic: function () {
      var http = Http(Config(specHelper.defaultConfig));
      http.post('/test/error', '', this.callback);
    },
    'returns the UnexpectedError': function (err, response) {
      assert.equal(err.type, braintree.errorTypes.unexpectedError);
    }
  }
}).export(module);

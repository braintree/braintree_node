require('../spec_helper');
var Util = require('../../lib/braintree/util').Util;

vows.describe('Util').addBatch({
  'toCamelCase': {
    'string with hyphens': {
      topic: Util.toCamelCase('one-two-three'),
      'is converted to camel case': function (result) {
        assert.equal(result, 'oneTwoThree');
      }
    },
    'string with hyphen followed by a number': {
      topic: Util.toCamelCase('last-4'),
      'removes the hyphen': function (result) {
        assert.equal(result, 'last4');
      }
    }
  }
}).export(module);


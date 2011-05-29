require('../spec_helper');
var Util = require('../../lib/braintree/util').Util;

vows.describe('Util').addBatch({
  'convertObjectKeysToUnderscores': {
    'object with camel case keys': {
      topic: Util.convertObjectKeysToUnderscores({
        topLevel: {
          nestedOne: {
            nestedTwo: 'aValue'
          }
        }
      }),
      'is converted to underscores': function (result) {
        assert.equal(result.top_level.nested_one.nested_two, 'aValue');
      }
    },
  },

  'toCamelCase': {
    'string with underscores': {
      topic: Util.toCamelCase('one_two_three'),
      'is converted to camel case': function (result) {
        assert.equal(result, 'oneTwoThree');
      }
    },

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
  },

  'toUnderscore': {
    'string that is camel case': {
      topic: Util.toUnderscore('oneTwoThree'),
      'is converted to underscores': function (result) {
        assert.equal(result, 'one_two_three');
      }
    },
  }
}).export(module);


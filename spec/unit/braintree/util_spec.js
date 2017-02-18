'use strict';

require('../../spec_helper');
let Util = require('../../../lib/braintree/util').Util;
let errorTypes = require('../../../lib/braintree/error_types').errorTypes;

describe('Util', function () {
  describe('convertObjectKeysToUnderscores', function () {
    it('works with camel case keys', function () {
      let result = Util.convertObjectKeysToUnderscores({
        topLevel: {
          nestedOne: {
            nestedTwo: 'aValue'
          }
        }
      });

      return assert.equal(result.top_level.nested_one.nested_two, 'aValue');
    });

    it('does not affect date values', function () {
      let result = Util.convertObjectKeysToUnderscores({
        someDate:
          new Date()
      });

      return assert.instanceOf(result.some_date, Date);
    });

    it('does not affect null', function () {
      let result = Util.convertObjectKeysToUnderscores({
        somethingNull:
          null
      });

      return assert.strictEqual(result.something_null, null);
    });

    it('works on array values', function () {
      let result = Util.convertObjectKeysToUnderscores({
        topLevel: {
          things: [
            {camelOne: 'value1', camelTwo: 'value2'},
            {camelOne: 'value3', camelTwo: 'value4'}
          ]
        }
      });

      assert.isArray(result.top_level.things);
      assert.equal(result.top_level.things[0].camel_one, 'value1');
      assert.equal(result.top_level.things[0].camel_two, 'value2');
      assert.equal(result.top_level.things[1].camel_one, 'value3');
      return assert.equal(result.top_level.things[1].camel_two, 'value4');
    });
  });

  describe('convertNodeToObject', function () {
    it('converts a single value', function () {
      let result = Util.convertNodeToObject('foobar');

      return assert.equal(result, 'foobar');
    });

    it('converts a hash of values', function () {
      let result = Util.convertNodeToObject({
        'foo-bar': 'baz',
        ping: 'pong'
      });

      return assert.deepEqual(result, {
        fooBar: 'baz',
        ping: 'pong'
      }
      );
    });

    it('converts a hash of hashes', function () {
      let result = Util.convertNodeToObject({
        'foo-bar': 'baz',
        hash: {
          'ping-pong': 'paddle'
        }
      });

      return assert.deepEqual(result, {
        fooBar: 'baz',
        hash: {
          pingPong: 'paddle'
        }
      }
      );
    });

    it('converts a collection with one item', function () {
      let result = Util.convertNodeToObject({
        'credit-card-transactions': {
          '@': {type: 'collection'},
          'current-page-number': {'#': '1', '@': {type: 'integer'}},
          'page-size': {'#': '50', '@': {type: 'integer'}},
          'total-items': {'#': '1', '@': {type: 'integer'}},
          transaction: {
            id: '22vwrm',
            status: 'settled'
          }
        }
      });

      return assert.deepEqual(result, {
        creditCardTransactions: {
          currentPageNumber: 1,
          pageSize: 50,
          totalItems: 1,
          transaction: {
            id: '22vwrm',
            status: 'settled'
          }
        }
      }
      );
    });

    it('coverts a collection with multiple items', function () {
      let result = Util.convertNodeToObject({
        'credit-card-transactions': {
          '@': {type: 'collection'},
          'current-page-number': {'#': '1', '@': {type: 'integer'}},
          'page-size': {'#': '50', '@': {type: 'integer'}},
          'total-items': {'#': '1', '@': {type: 'integer'}},
          transaction: [
             {id: '22yyyy'},
             {id: '22xxxx'}
          ]
        }
      });

      return assert.deepEqual(result, {
        creditCardTransactions: {
          currentPageNumber: 1,
          pageSize: 50,
          totalItems: 1,
          transaction: [
             {id: '22yyyy'},
             {id: '22xxxx'}
          ]
        }
      }
      );
    });

    it('converts an array with no items', function () {
      let result = Util.convertNodeToObject({
        '@': {
          type: 'array'
        }
      });

      return assert.deepEqual(result, []);
    });

    it('converts an array with one item', function () {
      let result = Util.convertNodeToObject({
        '@': {
          type: 'array'
        },
        item: {
          foo: 'bar'
        }
      });

      return assert.deepEqual(result, [{foo: 'bar'}]);
    });

    it('converts an array with multiple items', function () {
      let result = Util.convertNodeToObject({
        '@': {
          type: 'array'
        },
        item: [
          {prop: 'value'},
          {prop: 'value'}
        ]
      });

      return assert.deepEqual(result, [
        {prop: 'value'},
        {prop: 'value'}
      ]);
    });

    it('converts an array with a root element', function () {
      let result = Util.convertNodeToObject({
        items: {
          '@': {
            type: 'array'
          },
          item: [
            {prop: 'value'},
            {prop: 'value'}
          ]
        }
      });

      return assert.deepEqual(result, {
        items: [
          {prop: 'value'},
          {prop: 'value'}
        ]
      }
      );
    });

    it('converts nil object', function () {
      let result = Util.convertNodeToObject({
        '@': {
          nil: 'true'
        }
      });

      return assert.isNull(result);
    });

    it('converts symbols to strings', function () {
      let result = Util.convertNodeToObject({
        attribute: {
          '#': 'country_name',
          '@': {
            type: 'symbol'
          }
        }
      });

      return assert.deepEqual(result, {attribute: 'country_name'});
    });

    it('converts integers', function () {
      let result = Util.convertNodeToObject({
        attribute: {
          '#': '1234',
          '@': {
            type: 'integer'
          }
        }
      });

      return assert.deepEqual(result, {attribute: 1234});
    });

    it('converts booleans', function () {
      let result = Util.convertNodeToObject({
        a1: {
          '#': 'true',
          '@': {
            type: 'boolean'
          }
        },
        a2: {
          '#': 'false',
          '@': {
            type: 'boolean'
          }
        }
      });

      assert.isTrue(result.a1);
      return assert.isFalse(result.a2);
    });

    it('converts an empty object to an empty string', function () {
      let result = Util.convertNodeToObject({attribute: {}});

      return assert.deepEqual(result, {attribute: ''});
    });
  });

  describe('objectIsEmpty', function () {
    it('returns true for empty objects', function () {
      let result = Util.objectIsEmpty({});

      return assert.isTrue(result);
    });

    it('returns false for non-empty objects', function () {
      let result = Util.objectIsEmpty({key: 'value'});

      return assert.isFalse(result);
    });
  });

  describe('arrayIsEmpty', function () {
    it('returns true for empty arrays', function () {
      let result = Util.arrayIsEmpty([]);

      return assert.isTrue(result);
    });

    it('returns false for non-empty arrays', function () {
      let result = Util.arrayIsEmpty([1, 2, 3]);

      return assert.isFalse(result);
    });

    it('returns false if not given an array', function () {
      let result = Util.arrayIsEmpty({});

      return assert.isFalse(result);
    });
  });

  describe('toCamelCase', function () {
    it('converts a string with underscores', function () {
      let result = Util.toCamelCase('one_two_three');

      return assert.equal(result, 'oneTwoThree');
    });

    it('converts a string with hyphens', function () {
      let result = Util.toCamelCase('one-two-three');

      return assert.equal(result, 'oneTwoThree');
    });

    it('converts a string with a hyphen followed by a number', function () {
      let result = Util.toCamelCase('last-4');

      return assert.equal(result, 'last4');
    });
  });

  describe('toUnderscore', function () {
    it('converts a camel cased string', function () {
      let result = Util.toUnderscore('oneTwoThree');

      return assert.equal(result, 'one_two_three');
    });

    it('handles words with contiguous uppercase letters', function () {
      let result = Util.toUnderscore('headlineCNNNews');

      return assert.equal(result, 'headline_cnn_news');
    });
  });

  describe('flatten', function () {
    it('flattens a deeply nested array', function () {
      let result = Util.flatten([[1], [2, [3, [4, [5, [6, [7, [8, [9]]]]]]]]]);

      return assert.deepEqual(result, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('flattens an array with varying levels of nesting', function () {
      let result = Util.flatten([[1, 2], [3, 4], [5], [6, [7, [8, [9]]]]]);

      return assert.deepEqual(result, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('flattens a deeply nested single element array', function () {
      let result = Util.flatten([[[[[[[[[[[[[[[[[[[[1]]]]]]]]]]]]]]]]]]]]);

      return assert.deepEqual(result, [1]);
    });
  });

  describe('merge', function () {
    it('concats two objects', function () {
      let result = Util.merge({key: 'value', key2: 'value2'});

      return assert.deepEqual(result, {
        key: 'value',
        key2: 'value2'
      }
      );
    });

    it('overrides existing values', function () {
      let result = Util.merge({key: 'value'}, {key: 'value2'});

      return assert.deepEqual(result, {key: 'value2'});
    });
  });

  describe('without', function () {
    it('returns the difference between two arrays', function () {
      let result = Util.without([1, 2, 3, 4, 5], [1, 4]);

      return assert.deepEqual(result, [2, 3, 5]);
    });

    it('returns the initial array if there are no differences', function () {
      let result = Util.without([1, 2, 3], [4, 5]);

      return assert.deepEqual(result, [1, 2, 3]);
    });
  });

  describe('flattenKeys', () =>
    it('flattens an objects keys into a flat array', function () {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          threeDSecure: {
            required: true
          }
        }
      };

      let result = Util.flattenKeys(transactionParams);

      return assert.deepEqual(result, ['amount', 'creditCard[number]', 'creditCard[expirationDate]', 'options[threeDSecure][required]']);
    })
  );

  return describe('verifyKeys', function () {
    let signature, transactionParams;

    it("doesn't return an error if params are equal to the signature", function () {
      let signature = {
        valid: ['amount', 'creditCard[number]', 'creditCard[expirationDate]']
      };

      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      let error = Util.verifyKeys(signature, transactionParams);

      return assert.isUndefined(error);
    });

    it("doesn't return an error if params are a subset of signature", function () {
      let signature = {
        valid: ['validKey1', 'validKey2', 'amount', 'creditCard[number]', 'creditCard[expirationDate]']
      };

      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      let error = Util.verifyKeys(signature, transactionParams);

      return assert.isUndefined(error);
    });

    it('ignores specified keys without deleting them', () => {
      signature = {
        valid: ['amount', 'creditCard[number]', 'creditCard[expirationDate]'],
        ignore: ['topLevelKey', 'options[nested][key]']
      };

      transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        topLevelKey: {
          ignore: 'foo'
        },
        options: {
          nested: {
            key: {
              ignore: 'bar'
            }
          }
        }
      };

      Util.verifyKeys(signature, transactionParams);
      assert.equal(transactionParams.topLevelKey.ignore, 'foo');
      return assert.equal(transactionParams.options.nested.key.ignore, 'bar');
    }
    );

    it('returns an error if params are a superset of signature', function () {
      signature = {
        valid: ['amount', 'creditCard[number]']
      };

      transactionParams = {
        amount: '5.00',
        invalidKey: 'bar',
        creditCard: {
          number: '5105105105105100',
          nestedInvalidKey: '05/12'
        }
      };

      let error = Util.verifyKeys(signature, transactionParams);

      assert.instanceOf(error, Error);
      assert.equal(error.type, errorTypes.invalidKeysError);
      return assert.equal(error.message, 'These keys are invalid: invalidKey, creditCard[nestedInvalidKey]');
    });
  });
});

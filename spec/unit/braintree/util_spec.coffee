require('../../spec_helper')
{Util} = require('../../../lib/braintree/util')
{errorTypes} = require('../../../lib/braintree/error_types')

describe "Util", ->
  describe "convertObjectKeysToUnderscores", ->
    it "works with camel case keys", ->
      result = Util.convertObjectKeysToUnderscores(
        topLevel:
          nestedOne:
            nestedTwo: 'aValue'
      )

      assert.equal(result.top_level.nested_one.nested_two, 'aValue')

    it "does not affect date values", ->
      result = Util.convertObjectKeysToUnderscores(
        someDate:
          new Date()
      )

      assert.instanceOf(result.some_date, Date)

    it "does not affect null", ->
      result = Util.convertObjectKeysToUnderscores(
        somethingNull:
          null
      )

      assert.strictEqual(result.something_null, null)

    it "works on array values", ->
      result = Util.convertObjectKeysToUnderscores(
        topLevel:
          things: [
            {camelOne: 'value1', camelTwo: 'value2'}
            {camelOne: 'value3', camelTwo: 'value4'}
          ]
      )

      assert.isArray(result.top_level.things)
      assert.equal(result.top_level.things[0].camel_one, 'value1')
      assert.equal(result.top_level.things[0].camel_two, 'value2')
      assert.equal(result.top_level.things[1].camel_one, 'value3')
      assert.equal(result.top_level.things[1].camel_two, 'value4')

  describe "convertNodeToObject", ->
    it "converts a single value", ->
      result = Util.convertNodeToObject('foobar')
      assert.equal(result, 'foobar')

    it "converts a hash of values", ->
      result = Util.convertNodeToObject(
        'foo-bar': 'baz'
        'ping': 'pong'
      )

      assert.deepEqual(result,
        'fooBar': 'baz'
        'ping': 'pong'
      )

    it "converts a hash of hashes", ->
      result = Util.convertNodeToObject(
        'foo-bar': 'baz'
        'hash':
          'ping-pong': 'paddle'
      )

      assert.deepEqual(result,
        'fooBar': 'baz'
        'hash':
          'pingPong': 'paddle'
      )

    it "converts a collection with one item", ->
      result = Util.convertNodeToObject(
        'credit-card-transactions':
           '@': { type: 'collection' },
           'current-page-number': { '#': '1', '@': { type: 'integer' } },
           'page-size': { '#': '50', '@': { type: 'integer' } },
           'total-items': { '#': '1', '@': { type: 'integer' } },
           'transaction':
             id: '22vwrm',
             status: 'settled'
      )

      assert.deepEqual(result,
        'creditCardTransactions':
           'currentPageNumber': 1,
           'pageSize': 50,
           'totalItems': 1,
           'transaction':
             id: '22vwrm',
             status: 'settled'
      )

    it "coverts a collection with multiple items", ->
      result = Util.convertNodeToObject(
        'credit-card-transactions':
           '@': { type: 'collection' },
           'current-page-number': { '#': '1', '@': { type: 'integer' } },
           'page-size': { '#': '50', '@': { type: 'integer' } },
           'total-items': { '#': '1', '@': { type: 'integer' } },
           'transaction': [
             { id: '22yyyy' },
             { id: '22xxxx' },
           ]
      )

      assert.deepEqual(result,
        'creditCardTransactions':
           'currentPageNumber': 1,
           'pageSize': 50,
           'totalItems': 1,
           'transaction': [
             { id: '22yyyy' },
             { id: '22xxxx' },
           ]
      )

    it "converts an array with no items", ->
      result = Util.convertNodeToObject(
        '@':
          'type': 'array'
      )

      assert.deepEqual(result, [])

    it "converts an array with one item", ->
      result = Util.convertNodeToObject(
        '@':
          'type': 'array'
        'item':
          'foo': 'bar'
      )

      assert.deepEqual(result, ['foo': 'bar'])

    it "converts an array with multiple items", ->
      result = Util.convertNodeToObject(
        '@':
          'type': 'array'
        'item': [
          {'prop': 'value'},
          {'prop': 'value'}
        ]
      )

      assert.deepEqual(result, [
        {'prop': 'value'},
        {'prop': 'value'}
      ])

    it "converts an array with a root element", ->
      result = Util.convertNodeToObject(
        'items':
          '@':
            'type': 'array'
          'item': [
            {'prop': 'value'},
            {'prop': 'value'}
          ]
      )

      assert.deepEqual(result,
        'items': [
          {'prop': 'value'},
          {'prop': 'value'}
        ]
      )

    it "converts nil object", ->
      result = Util.convertNodeToObject(
        '@':
          nil: 'true'
      )

      assert.isNull(result)

    it "converts symbols to strings", ->
      result = Util.convertNodeToObject(
        attribute:
          '#': 'country_name'
          '@':
            type: 'symbol'
      )

      assert.deepEqual(result, 'attribute': 'country_name')

    it "converts integers", ->
      result = Util.convertNodeToObject(
        attribute:
          '#': '1234'
          '@':
            type: 'integer'
      )

      assert.deepEqual(result, 'attribute': 1234)

    it "converts booleans", ->
      result = Util.convertNodeToObject(
        'a1':
          '#': 'true'
          '@':
            'type': 'boolean'
        'a2':
          '#': 'false'
          '@':
            'type': 'boolean'
      )

      assert.isTrue(result.a1)
      assert.isFalse(result.a2)

    it "converts an empty object to an empty string", ->
      result = Util.convertNodeToObject(attribute: {})

      assert.deepEqual(result, 'attribute': '')

  describe "objectIsEmpty", ->
    it "returns true for empty objects", ->
      result = Util.objectIsEmpty({})

      assert.isTrue(result)

    it "returns false for non-empty objects", ->
        result = Util.objectIsEmpty(key: 'value')

        assert.isFalse(result)

  describe "arrayIsEmpty", ->
    it "returns true for empty arrays", ->
      result = Util.arrayIsEmpty([])

      assert.isTrue(result)

    it "returns false for non-empty arrays", ->
      result = Util.arrayIsEmpty([1, 2, 3])

      assert.isFalse(result)

    it "returns false if not given an array", ->
      result = Util.arrayIsEmpty({})

      assert.isFalse(result)

  describe "toCamelCase", ->
    it "converts a string with underscores", ->
      result = Util.toCamelCase('one_two_three')

      assert.equal(result, 'oneTwoThree')

    it "converts a string with hyphens", ->
      result = Util.toCamelCase('one-two-three')

      assert.equal(result, 'oneTwoThree')

    it "converts a string with a hyphen followed by a number", ->
      result = Util.toCamelCase('last-4')

      assert.equal(result, 'last4')

  describe "toUnderscore", ->
    it "converts a camel cased string", ->
      result = Util.toUnderscore('oneTwoThree')

      assert.equal(result, 'one_two_three')

    it "handles words with contiguous uppercase letters", ->
      result = Util.toUnderscore('headlineCNNNews')

      assert.equal(result, 'headline_cnn_news')


  describe "flatten", ->
    it "flattens a deeply nested array", ->
      result = Util.flatten([[1], [2, [3, [4, [5, [6, [7, [8, [9]]]]]]]]])

      assert.deepEqual(result, [1, 2, 3, 4, 5, 6, 7, 8, 9])

    it "flattens an array with varying levels of nesting", ->
      result = Util.flatten([[1, 2], [3, 4], [5], [6, [7, [8, [9]]]]])

      assert.deepEqual(result, [1, 2, 3, 4, 5, 6, 7, 8, 9])

    it "flattens a deeply nested single element array", ->
      result = Util.flatten([[[[[[[[[[[[[[[[[[[[1]]]]]]]]]]]]]]]]]]]])

      assert.deepEqual(result, [1])

  describe "merge", ->
    it "concats two objects", ->
      result = Util.merge(key: 'value', key2: 'value2')

      assert.deepEqual(result,
        key: 'value'
        key2: 'value2'
      )

    it "overrides existing values", ->
      result = Util.merge(key: 'value', key: 'value2')

      assert.deepEqual(result, key: 'value2')

  describe "without", ->
    it "returns the difference between two arrays", ->
      result = Util.without([1,2,3,4,5], [1,4])

      assert.deepEqual(result, [2,3,5])

    it "returns the initial array if there are no differences", ->
      result = Util.without([1,2,3], [4,5])

      assert.deepEqual(result, [1,2,3])

  describe "flattenKeys", ->
    it "flattens an objects keys into a flat array", ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          threeDSecure:
            required: true

      result = Util.flattenKeys(transactionParams)
      assert.deepEqual(result, ["amount", "creditCard[number]", "creditCard[expirationDate]", "options[threeDSecure][required]"])

  describe "verifyKeys", ->
    it "doesn't return an error if params are equal to the signature", ->
      signature = {
        valid: ["amount", "creditCard[number]", "creditCard[expirationDate]"]
      }

      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      error = Util.verifyKeys(signature, transactionParams)
      assert.isUndefined(error)

    it "doesn't return an error if params are a subset of signature", ->
      signature = {
        valid: ["validKey1", "validKey2", "amount", "creditCard[number]", "creditCard[expirationDate]"]
      }

      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      error = Util.verifyKeys(signature, transactionParams)
      assert.isUndefined(error)

    it "ignores specified keys without deleting them", =>
      signature = {
        valid: ["amount", "creditCard[number]", "creditCard[expirationDate]"]
        ignore: ["topLevelKey", "options[nested][key]"]
      }

      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        topLevelKey:
          ignore: 'foo'
        options:
          nested:
            key:
              ignore: 'bar'

      Util.verifyKeys(signature, transactionParams)
      assert.equal(transactionParams.topLevelKey.ignore, "foo")
      assert.equal(transactionParams.options.nested.key.ignore, "bar")

    it "returns an error if params are a superset of signature", ->
      signature = {
        valid: ["amount", "creditCard[number]"]
      }

      transactionParams =
        amount: '5.00'
        invalidKey: 'bar'
        creditCard:
          number: '5105105105105100'
          nestedInvalidKey: '05/12'

      error = Util.verifyKeys(signature, transactionParams)
      assert.instanceOf(error, Error)
      assert.equal(error.type, errorTypes.invalidKeysError)
      assert.equal(error.message, 'These keys are invalid: invalidKey, creditCard[nestedInvalidKey]')

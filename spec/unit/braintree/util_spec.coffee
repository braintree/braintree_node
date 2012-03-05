require('../../spec_helper')
{Util} = require('../../../lib/braintree/util')

vows
  .describe('Util')
  .addBatch
    'convertObjectKeysToUnderscores':
      'object with camel case keys':
        topic: Util.convertObjectKeysToUnderscores(
          topLevel:
            nestedOne:
              nestedTwo: 'aValue'
        )
        'is converted to underscores': (result) ->
          assert.equal(result.top_level.nested_one.nested_two, 'aValue')

      'objects containing data values':
        topic: Util.convertObjectKeysToUnderscores(
          someDate:
            new Date()
        )
        'does not affect the date': (result) ->
          assert.instanceOf(result.some_date, Date)

      'object with an array with objects with camel case keys':
        topic: Util.convertObjectKeysToUnderscores(
          topLevel:
            things: [
              {camelOne: 'value1', camelTwo: 'value2'}
              {camelOne: 'value3', camelTwo: 'value4'}
            ]
        )
        'converts array items to underscores': (result) ->
          assert.isArray(result.top_level.things)
          assert.equal(result.top_level.things[0].camel_one, 'value1')
          assert.equal(result.top_level.things[0].camel_two, 'value2')
          assert.equal(result.top_level.things[1].camel_one, 'value3')
          assert.equal(result.top_level.things[1].camel_two, 'value4')

    'convertNodeToObject':
      'single value':
        topic: Util.convertNodeToObject('foobar')
        'is converted to an object': (result) ->
          assert.equal(result, 'foobar')

      'hash of values':
        topic: Util.convertNodeToObject(
          'foo-bar': 'baz'
          'ping': 'pong'
        )
        'is converted to an object': (result) ->
          assert.deepEqual(result,
            'fooBar': 'baz'
            'ping': 'pong'
          )

      'hash of hash of values':
        topic: Util.convertNodeToObject(
          'foo-bar': 'baz'
          'hash':
            'ping-pong': 'paddle'
        )
        'is converted to an object': (result) ->
          assert.deepEqual(result,
            'fooBar': 'baz'
            'hash':
              'pingPong': 'paddle'
          )

      'a collection with one item':
        topic: Util.convertNodeToObject(
          'credit-card-transactions':
             '@': { type: 'collection' },
             'current-page-number': { '#': '1', '@': { type: 'integer' } },
             'page-size': { '#': '50', '@': { type: 'integer' } },
             'total-items': { '#': '1', '@': { type: 'integer' } },
             'transaction':
               id: '22vwrm',
               status: 'settled'
        )
        'is converted to an object': (result) ->
          assert.deepEqual(result,
            'creditCardTransactions':
               'currentPageNumber': 1,
               'pageSize': 50,
               'totalItems': 1,
               'transaction':
                 id: '22vwrm',
                 status: 'settled'
          )

      'a collection with multiple item':
        topic: Util.convertNodeToObject(
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
        'is converted to an object': (result) ->
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

      'array as object with no items':
        topic: Util.convertNodeToObject(
          '@':
            'type': 'array'
        )
        'is converted to an object': (result) ->
          assert.deepEqual(result, [])

      'array as object with one item':
        topic: Util.convertNodeToObject(
          '@':
            'type': 'array'
          'item':
            'foo': 'bar'
        )
        'is converted to an object': (result) ->
          assert.deepEqual(result, ['foo': 'bar'])

      'array as object with multiple items':
        topic: Util.convertNodeToObject(
          '@':
            'type': 'array'
          'item': [
            {'prop': 'value'},
            {'prop': 'value'}
          ]
        )
        'is converted to an object': (result) ->
          assert.deepEqual(result, [
            {'prop': 'value'},
            {'prop': 'value'}
          ])

      'array as object with root element':
        topic: Util.convertNodeToObject(
          'items':
            '@':
              'type': 'array'
            'item': [
              {'prop': 'value'},
              {'prop': 'value'}
            ]
        )
        'is converted to an object': (result) ->
          assert.deepEqual(result,
            'items': [
              {'prop': 'value'},
              {'prop': 'value'}
            ]
          )

      'nil object':
        topic: Util.convertNodeToObject(
          '@':
            nil: 'true'
        )
        'is converted to null': (result) ->
          assert.isNull(result)

      'symbol':
        topic: Util.convertNodeToObject(
          attribute:
            '#': 'country_name'
            '@':
              type: 'symbol'
        )
        'is converted to string': (result) ->
          assert.deepEqual(result, 'attribute': 'country_name')

      'integer':
        topic: Util.convertNodeToObject(
          attribute:
            '#': '1234'
            '@':
              type: 'integer'
        )
        'is converted to integer': (result) ->
          assert.deepEqual(result, 'attribute': 1234)

      'boolean':
        topic: Util.convertNodeToObject(
          'a1':
            '#': 'true'
            '@':
              'type': 'boolean'
          'a2':
            '#': 'false'
            '@':
              'type': 'boolean'
        )
        'is converted to boolean': (result) ->
          assert.isTrue(result.a1)
          assert.isFalse(result.a2)

      'empty object':
        topic: Util.convertNodeToObject(attribute: {})
        'is converted to empty string': (result) ->
          assert.deepEqual(result, 'attribute': '')

    'objectIsEmpty':
      'empty object':
        topic: Util.objectIsEmpty({})
        'returns true': (result) ->
          assert.isTrue(result)

      'non-empty object':
        topic: Util.objectIsEmpty(key: 'value')
        'returns false': (result) ->
          assert.isFalse(result)

    'arrayIsEmpty':
      'empty array':
        topic: Util.arrayIsEmpty([])
        'returns true': (result) ->
          assert.isTrue(result)

      'non-empty array':
        topic: Util.arrayIsEmpty([1, 2, 3])
        'returns false': (result) ->
          assert.isFalse(result)

      'not an array':
        topic: Util.arrayIsEmpty({})
        'returns false': (result) ->
          assert.isFalse(result)

    'toCamelCase':
      'string with underscores':
        topic: Util.toCamelCase('one_two_three')
        'is converted to camel case': (result) ->
          assert.equal(result, 'oneTwoThree')

      'string with hyphens':
        topic: Util.toCamelCase('one-two-three')
        'is converted to camel case': (result) ->
          assert.equal(result, 'oneTwoThree')

      'string with hyphen followed by a number':
        topic: Util.toCamelCase('last-4')
        'removes the hyphen': (result) ->
          assert.equal(result, 'last4')

    'toUnderscore':
      'string that is camel case':
        topic: Util.toUnderscore('oneTwoThree')
        'is converted to underscores': (result) ->
          assert.equal(result, 'one_two_three')

    'flatten':
      'deeply nested array':
        topic: Util.flatten([[1], [2, [3, [4, [5, [6, [7, [8, [9]]]]]]]]])
        'returns flattened array': (result) ->
          assert.deepEqual(result, [1, 2, 3, 4, 5, 6, 7, 8, 9])

      'varying nest level array':
        topic: Util.flatten([[1, 2], [3, 4], [5], [6, [7, [8, [9]]]]])
        'returns flattened array': (result) ->
          assert.deepEqual(result, [1, 2, 3, 4, 5, 6, 7, 8, 9])

      'deeply nested single element array':
        topic: Util.flatten([[[[[[[[[[[[[[[[[[[[1]]]]]]]]]]]]]]]]]]]])
        'returns flattened array': (result) ->
          assert.deepEqual(result, [1])

    'merge':
      'concatenation':
        topic: Util.merge(key: 'value', key2: 'value2')
        'returns merged object': (result) ->
          assert.deepEqual(result,
            key: 'value'
            key2: 'value2'
          )

      'overriding existing value':
        topic: Util.merge(key: 'value', key: 'value2')
        'returns merged object': (result) ->
          assert.deepEqual(result, key: 'value2')

    'without':
      'returns the difference between two arrays':
        topic: Util.without([1,2,3,4,5], [1,4])
        'returns new array': (result) ->
          assert.deepEqual(result, [2,3,5])

      'returns the same array':
        topic: Util.without([1,2,3], [4,5])
        'returns array': (result) ->
          assert.deepEqual(result, [1,2,3])

  .export(module)

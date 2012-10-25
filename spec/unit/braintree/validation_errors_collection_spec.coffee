require('../../spec_helper')
{ValidationErrorsCollection} = require('../../../lib/braintree/validation_errors_collection')

describe "ValidationErrorsCollection", ->
  describe "on", ->
    it "allows accessing errors", ->
      result = new ValidationErrorsCollection(
        errors: [
          {attribute: 'foo', code: '1'},
          {attribute: 'foo', code: '2'}
        ]
      )

      assert.equal(result.on('foo').length, 2)
      assert.equal(result.on('foo')[0].code, '1')
      assert.equal(result.on('foo')[1].code, '2')

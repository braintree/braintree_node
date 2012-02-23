require('../../spec_helper')
{ValidationErrorsCollection} = require('../../../lib/braintree/validation_errors_collection')

vows
  .describe('ValidationErrorsCollection')
  .addBatch
    'retreiving errors on attribute':
      'with mutliple errors on a single attribute':
        topic: new ValidationErrorsCollection(
          errors: [
            {attribute: 'foo', code: '1'},
            {attribute: 'foo', code: '2'}
          ]
        )
        'returns an array of errors': (result) ->
          assert.equal(result.on('foo').length, 2)
          assert.equal(result.on('foo')[0].code, '1')
          assert.equal(result.on('foo')[1].code, '2')

  .export(module)

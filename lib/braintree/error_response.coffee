{Transaction} = require('./transaction')
{ValidationErrorsCollection} = require('./validation_errors_collection')

ErrorResponse = (attributes) ->
  that = {}
  for key, value of attributes
    that[key] = value
  that.success = false
  that.errors = ValidationErrorsCollection(attributes.errors)
  that.transaction = Transaction(attributes.transaction) if attributes.transaction
  that

exports.ErrorResponse = ErrorResponse

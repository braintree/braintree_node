Util = require('./util').Util
ValidationError = require('./validation_error').ValidationError

ValidationErrorsCollection = (errorAttributes) ->
  my = {
    validationErrors: {},
    errorCollections: {}
  }

  buildErrors = (errors) ->
    for item in errors
      my.validationErrors[Util.toCamelCase(item.attribute)] = ValidationError(item)

  for key, val of errorAttributes
    if key is 'errors'
      buildErrors(val)
    else
      my.errorCollections[key] = ValidationErrorsCollection(val)


  {
    deepErrors: () ->
      deepErrors = []
      for key, val of my.validationErrors
        deepErrors.push(val)

      for key, val of my.errorCollections
        deepErrors = deepErrors.concat(val.deepErrors())

      deepErrors

    for: (name) -> my.errorCollections[name]

    on: (name) -> my.validationErrors[name]
  }

exports.ValidationErrorsCollection = ValidationErrorsCollection

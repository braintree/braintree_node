{Util} = require('./util')
{ValidationError} = require('./validation_error')

ValidationErrorsCollection = (errorAttributes) ->
  my = {
    validationErrors: {},
    errorCollections: {}
  }

  buildErrors = (errors) ->
    for item in errors
      key = Util.toCamelCase(item.attribute)
      my.validationErrors[key] or= []
      my.validationErrors[key].push ValidationError(item)

  for key, val of errorAttributes
    if key is 'errors'
      buildErrors(val)
    else
      my.errorCollections[key] = ValidationErrorsCollection(val)


  {
    deepErrors: () ->
      deepErrors = []
      for key, val of my.validationErrors
        deepErrors = deepErrors.concat(val)

      for key, val of my.errorCollections
        deepErrors = deepErrors.concat(val.deepErrors())

      deepErrors

    for: (name) -> my.errorCollections[name]
    forIndex: (index) -> my.errorCollections["index#{index}"]
    on: (name) -> my.validationErrors[name]
  }

exports.ValidationErrorsCollection = ValidationErrorsCollection

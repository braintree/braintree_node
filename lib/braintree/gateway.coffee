{ErrorResponse} = require('./error_response')

class Gateway
  createResponseHandler: (attributeName, klass, callback) ->
    (err, response) ->
      return callback(err, response) if err

      if (response[attributeName])
        response.success = true
        response[attributeName] = new klass(response[attributeName]) if klass?
        callback(null, response)
      else if (response.apiErrorResponse)
        callback(null, new ErrorResponse(response.apiErrorResponse))

  searchResponseHandler: (callback) ->
    @createResponseHandler("searchResults", null, callback)

exports.Gateway = Gateway

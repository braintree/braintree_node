{ErrorResponse} = require('./error_response')
{SearchResponse} = require ('./search_response')

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

  searchResponseHandler: (pagingFunction, callback) ->
    (err, response) ->
      return callback(err, response) if err
      if (response["searchResults"])
        container = new SearchResponse(pagingFunction, response)
        callback(null, container)
      else if (response.apiErrorResponse)
        callback(null, new ErrorResponse(response.apiErrorResponse))

exports.Gateway = Gateway

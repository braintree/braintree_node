{ErrorResponse} = require('./error_response')
{SearchResponse} = require ('./search_response')
exceptions = require('./exceptions')
_ = require('underscore')

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

  createSearchResponse: (url, search, pagingFunction, callback) ->
    if callback?
      @gateway.http.post(url, {search : search.toHash()}, @searchResponseHandler(pagingFunction, callback))
    else
      searchResponse = new SearchResponse

      @gateway.http.post url, {search : search.toHash()}, (err, response) ->
        if err?
          searchResponse.setFatalError(err)
        else if (response["searchResults"])
          searchResponse.setResponse(response)
          searchResponse.setPagingFunction(pagingFunction)
        else if (response.apiErrorResponse)
          searchResponse.setFatalError(new ErrorResponse(response.apiErrorResponse))
        else
          searchResponse.setFatalError(exceptions.DownForMaintenanceError("Down for Maintenance"))

        searchResponse.ready()

      searchResponse.stream

  searchResponseHandler: (pagingFunction, callback) ->
    (err, response) ->
      return callback(err, response) if err
      if (response["searchResults"])
        container = new SearchResponse(pagingFunction, response)
        callback(null, container)
      else if (response.apiErrorResponse)
        callback(null, new ErrorResponse(response.apiErrorResponse))
      else
        callback(exceptions.DownForMaintenanceError("Down for Maintenance"), null)

  pagingFunctionGenerator: (search, url, subjectType, getSubject) ->
    (ids, callback) =>
      search.ids().in(ids)
      @gateway.http.post("/" + url + "/advanced_search",
        { search : search.toHash() },
        (err, response) ->
          if err
            callback(err, null)
          else
            if _.isArray(getSubject(response))
              for subject in getSubject(response)
                callback(null, new subjectType(subject))
            else
              callback(null, new subjectType(getSubject(response))))

exports.Gateway = Gateway

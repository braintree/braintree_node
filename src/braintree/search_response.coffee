_ = require('underscore')
{SearchResponseStream} = require('./search_response_stream')

class SearchResponse
  constructor: (pagingFunction, results) ->
    if pagingFunction?
      @setPagingFunction(pagingFunction)

    if results?
      @setResponse(results)

    @stream = new SearchResponseStream(this)

    @success = true

  each: (callback) ->
    _.each(_.range(0, @ids.length, @pageSize), (offset) =>
      @pagingFunction(@ids.slice(offset, offset + @pageSize), callback))

  first: (callback)->
    if @ids.length == 0
      callback(null, null)
    else
      @pagingFunction([@ids[0]], callback)

  length: ->
    @ids.length

  ready: ->
    @stream.ready()

  setFatalError: (error) ->
    @fatalError = error

  setResponse: (results) ->
    @ids = results.searchResults.ids
    @pageSize = parseInt(results.searchResults.pageSize)

  setPagingFunction: (pagingFunction) ->
    @pagingFunction = pagingFunction

exports.SearchResponse = SearchResponse

_ = require('underscore')
{Util} = require('./util')

class SearchResponse
  constructor: (pagingFunction, results) ->
    if pagingFunction?
      @setPagingFunction(pagingFunction)

    if results?
      @setResponse(results)

    if Util.supportsStreams()
      {SearchResponseStream} = require('./search_response_stream')
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
    @stream.ready() if @stream?

  setFatalError: (error) ->
    @fatalError = error

  setResponse: (results) ->
    @ids = results.searchResults.ids
    @pageSize = parseInt(results.searchResults.pageSize)

  setPagingFunction: (pagingFunction) ->
    @pagingFunction = pagingFunction

exports.SearchResponse = SearchResponse

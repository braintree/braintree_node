_ = require('underscore')
{EventEmitter} = require('events')

class SearchResponse extends EventEmitter
  constructor: (pagingFunction, results) ->
    if pagingFunction?
      @setPagingFunction(pagingFunction)

    if results?
      @setResponse(results)

    @success = true

  setResponse: (results) ->
    @ids = results.searchResults.ids
    @pageSize = parseInt(results.searchResults.pageSize)

  setPagingFunction: (pagingFunction) ->
    @pagingFunction = pagingFunction

  first: (callback)->
    if @ids.length == 0
      callback(null, null)
    else
      @pagingFunction([@ids[0]], callback)

  each: (callback) ->
    _.each(_.range(0, @ids.length, @pageSize), (offset) =>
      @pagingFunction(@ids.slice(offset, offset + @pageSize), callback))

  ready: ->
    @readyToStart = true
    @execute() if @executing?

  execute: ->
    @executing = true

    return unless @readyToStart

    itemCount = 0

    _.each _.range(0, @ids.length, @pageSize), (offset) =>
      @pagingFunction @ids.slice(offset, offset + @pageSize), (err, item) =>
        itemCount += 1

        if err?
          @emit('error', err)
        else
          @emit('data', item)

        @emit('end') if itemCount == @ids.length

  length: ->
    @ids.length

exports.SearchResponse = SearchResponse

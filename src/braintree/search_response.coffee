_ = require('underscore')

class SearchResponse
  constructor: (pagingFunction, results) ->
    @ids = results.searchResults.ids
    @pageSize = parseInt(results.searchResults.pageSize)
    @pagingFunction = pagingFunction
    @success = true

  first: (callback)->
    if @ids.length == 0
      callback(null, null)
    else
      @pagingFunction([@ids[0]], callback)

  each: (callback) ->
    _.each(_.range(0, @ids.length, @pageSize), (offset) =>
      @pagingFunction(@ids.slice(offset, offset + @pageSize), callback))

  length: ->
    @ids.length

exports.SearchResponse = SearchResponse

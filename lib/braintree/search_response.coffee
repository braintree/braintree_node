{Transaction} = require('./transaction')
{Customer} = require('./customer')

class SearchResponse
  constructor: (gateway, klass, results) ->
    @klass = klass
    @ids = results.searchResults.ids
    @gateway = gateway
    for key, value of results
      @[key] = value
    @success = true

  first: (callback)->
    @gateway.find(@ids[0], callback)

  length: ->
    @ids.length

exports.SearchResponse = SearchResponse

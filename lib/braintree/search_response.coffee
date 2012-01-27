class SearchResponse
  constructor: (gateway, results) ->
    @ids = results.searchResults.ids
    @gateway = gateway
    @success = true

  first: (callback)->
    if @ids.length == 0
      callback(null, null)
    else
      @gateway.find(@ids[0], callback)

  # TODO: Should we provide this massively paralell version of each??
  # each: (callback)->
  #   for id in @ids
  #     @gateway.find(id, callback)

  next: (resultsLeft, callback) ->
    if resultsLeft.length > 0
      @gateway.find(resultsLeft[0], (err, result) =>
        callback(err, result)
        @next(resultsLeft.slice(1), callback)
      )

  each: (callback)->
    @next(@ids, callback)

  length: ->
    @ids.length

exports.SearchResponse = SearchResponse

{PaginatedResponseStream} = require('./paginated_response_stream')

class PaginatedResponse
  constructor: (pagingFunction) ->
    @pagingFunction = pagingFunction
    @stream = new PaginatedResponseStream(this)

  all: (callback) ->
    results = []
    @stream.on "data", (data) ->
      results.push(data)
    @stream.on "end", ->
      callback(null, results)
    @stream.on "error", (err) ->
      callback(err)
    @stream.ready()

  ready: ->
    @stream.ready()

exports.PaginatedResponse = PaginatedResponse

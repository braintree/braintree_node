_ = require('underscore')
{Readable} = require('stream')

class SearchResponse extends Readable
  constructor: (pagingFunction, results) ->
    super(objectMode: true)

    if pagingFunction?
      @setPagingFunction(pagingFunction)

    if results?
      @setResponse(results)

    @success = true
    @currentItem = 0
    @currentOffset = 0
    @bufferedResults = []

  addError: (error) ->
    @fatalError = error

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
    @emit('ready')

  _read: ->
    if @readyToStart?
      @nextItem()
    else
      @on 'ready', =>
        @nextItem()

  nextItem: ->
    if @fatalError?
      @emit('error', @fatalError)
      @push(null)
    else if @bufferedResults.length > 0
      @push(@bufferedResults.shift())
    else if @currentItem >= @ids.length
      @push(null)
    else
      index = 0

      @pagingFunction @ids.slice(@currentOffset, @currentOffset + @pageSize), (err, item) =>
        if err?
          @emit('error', err)
        else
          @bufferedResults.push(item)

        @currentItem += 1
        index += 1

        if index == @pageSize or @currentItem == @ids.length
          @push(@bufferedResults.shift())

      @currentOffset += @pageSize

  length: ->
    @ids.length

exports.SearchResponse = SearchResponse

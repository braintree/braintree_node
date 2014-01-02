_ = require('underscore')
{Readable} = require('stream')

class SearchResponseStream extends Readable
  constructor: (searchResponse) ->
    super(objectMode: true)

    @searchResponse = searchResponse
    @currentItem = 0
    @currentOffset = 0
    @bufferedResults = []

  nextItem: ->
    if @searchResponse.fatalError?
      @emit('error', @searchResponse.fatalError)
      @push(null)
    else if @bufferedResults.length > 0
      @pushBufferedResults()
    else if @currentItem >= @searchResponse.ids.length
      @push(null)
    else
      index = 0

      @searchResponse.pagingFunction @searchResponse.ids.slice(@currentOffset, @currentOffset + @searchResponse.pageSize), (err, item) =>
        if err?
          @emit('error', err)
        else
          @bufferedResults.push(item)

        @currentItem += 1
        index += 1

        if index == @searchResponse.pageSize or @currentItem == @searchResponse.ids.length
          @push(@bufferedResults.shift())

      @currentOffset += @searchResponse.pageSize

  pushBufferedResults: ->
    while @bufferedResults.length > 0
      result = @push(@bufferedResults.shift())
      break if result == false

  ready: ->
    @readyToStart = true
    @emit('ready')

  _read: ->
    if @readyToStart?
      @nextItem()
    else
      @on 'ready', =>
        @nextItem()

exports.SearchResponseStream = SearchResponseStream

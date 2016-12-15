Readable = require('stream').Readable or require('readable-stream').Readable

class PaginatedResponseStream extends Readable
  constructor: (paginatedResponse) ->
    super(objectMode: true)

    @paginatedResponse = paginatedResponse
    @pageSize = 0
    @currentPage = 0
    @index = 0
    @totalItems = 0
    @items = []

  nextItem: ->
    if @currentPage == 0 || @index % @pageSize == 0
      @currentPage++
      @paginatedResponse.pagingFunction @currentPage, (err, totalItems, pageSize, items) =>
        if err?
          @emit('error', err)
          return
        @totalItems = totalItems
        @pageSize = pageSize
        @items = items
        @index++
        @push(@items.shift())
    else if @index >= @totalItems
      @push(null)
    else
      @index++
      @push(@items.shift())

  ready: ->
    @readyToStart = true
    @emit('ready')

  _read: ->
    if @readyToStart?
      @nextItem()
    else
      @on 'ready', =>
        @nextItem()

exports.PaginatedResponseStream = PaginatedResponseStream

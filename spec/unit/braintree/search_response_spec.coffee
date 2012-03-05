require("../../spec_helper")
{SearchResponse} = require('../../../lib/braintree/search_response')

vows
  .describe("SearchResponse")
  .addBatch
    "first":
      "with results":
        topic: ->
          fakeGateway =
            find: (id, callback) ->
              throw new Error("This exception SHOULD be thrown")
          fakeResults =
            searchResults:
              ids: [ specHelper.randomId() ]
          new SearchResponse(fakeGateway, fakeResults)
        "calls gateway#find": (searchResponse) ->
          assert.throws(->
            searchResponse.first()
          , Error)
      "zero results":
        topic: ->
          fakeGateway =
            find: (id, callback) ->
              throw new Error("This exception should NOT be thrown")
          fakeResults =
            searchResults:
              ids: []
          new SearchResponse(fakeGateway, fakeResults)
        "does not call gateway#find": (searchResponse) ->
          response = undefined
          callback = ->
            response = true
          assert.doesNotThrow(->
            searchResponse.first(callback)
          , Error)
          assert.isTrue(response)
    "each":
      "zero results":
        topic: ->
          fakePagingFunction = (ids, callback) ->
              throw new Error("This exception should NOT be thrown")
          fakeResults =
            searchResults:
              ids: []
          new SearchResponse(fakePagingFunction, fakeResults)
        "does not call pagingFunction": (searchResponse) ->
          assert.doesNotThrow(->
            searchResponse.each()
          , Error)
    "length":
      topic: ->
        fakeResults =
          searchResults:
            ids: [ 1, 2 ]
        new SearchResponse(null, fakeResults)
      "returns 2": (searchResponse) ->
        assert.equal(searchResponse.length(), 2)

  .export(module)

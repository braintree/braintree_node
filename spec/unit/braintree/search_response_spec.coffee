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
              throw new Error("This exception SHOULD be called")
          fakeResults =
            searchResults:
              ids: [ specHelper.randomId() ]
          new SearchResponse(fakeGateway, fakeResults)
        "calls first": (searchResponse) ->
          assert.throws(->
            searchResponse.first()
          , Error)
      "zero results":
        topic: ->
          fakeGateway =
            find: (id, callback) ->
              throw new Error("This exception should NOT be called")
          fakeResults =
            searchResults:
              ids: []
          new SearchResponse(fakeGateway, fakeResults)
        "does not call first": (searchResponse) ->
          response = undefined
          callback = ->
            response = true
          assert.doesNotThrow(->
            searchResponse.first(callback)
          , Error)
          assert.isTrue(response)

  .export(module)

require("../../spec_helper")
{SearchResponse} = require('../../../lib/braintree/search_response')

describe "SearchResponse", ->
  describe "first", ->
    it "calls gateway#find with results", ->
      fakeGateway =
        find: (id, callback) ->
          throw new Error("This exception SHOULD be thrown")
      fakeResults =
        searchResults:
          ids: [ specHelper.randomId() ]

      searchResponse = new SearchResponse(fakeGateway, fakeResults)

      assert.throws((=> @searchResponse.first()), Error)

    it "does not call gateway#find with zero results", (done) ->
      fakeGateway =
        find: (id, callback) ->
          throw new Error("This exception should NOT be thrown")
      fakeResults =
        searchResults:
          ids: []
      searchResponse = new SearchResponse(fakeGateway, fakeResults)

      searchResponse.first ->
        assert.isTrue true
        done()

  describe "each", ->
    it "does not call pagingFunding with zero results", ->
      fakePagingFunction = (ids, callback) ->
          throw new Error("This exception should NOT be thrown")
      fakeResults =
        searchResults:
          ids: []

      searchResponse = new SearchResponse(fakePagingFunction, fakeResults)

      assert.doesNotThrow((-> searchResponse.each()), Error)

  describe "length", ->
    it "returns the correct length", ->
      fakeResults =
        searchResults:
          ids: [ 1, 2 ]

      searchResponse = new SearchResponse(null, fakeResults)

      assert.equal(searchResponse.length(), 2)

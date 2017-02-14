require('../../spec_helper')

braintree = specHelper.braintree
{PaginatedResponse} = require('../../../lib/braintree/paginated_response')

describe "PaginatedResponse", ->
  describe "nextItem", ->
    it "only gets one page when page size and total size are the same", (done) ->
      pagingFunction = (currentPage, callback) ->
        if (currentPage > 1)
          callback("too many pages requested", 1, 1, [])
        else
          callback(null, 1, 1, [1])

      response = new PaginatedResponse(pagingFunction)
      response.all (err, results) ->
        assert.isTrue(err == null)
        done()

    it "fetches collections of less than one page", (done) ->
      pagingFunction = (currentPage, callback) ->
        if (currentPage > 1)
          callback("too many pages requested", 2, 5, [])
        else
          callback(null, 2, 5, [1, 2])

      response = new PaginatedResponse(pagingFunction)
      response.all (err, results) ->
        assert.isTrue(err == null)
        assert.equal(results[0], 1)
        assert.equal(results[1], 2)
        done()

    it "fetches multiple pages", (done) ->
      pagingFunction = (currentPage, callback) ->
        if (currentPage > 2)
          callback("too many pages requested", 2, 1, [])
        else
          callback(null, 2, 1, [currentPage])

      response = new PaginatedResponse(pagingFunction)
      response.all (err, results) ->
        assert.isTrue(err == null)
        assert.equal(results[0], 1)
        assert.equal(results[1], 2)
        done()

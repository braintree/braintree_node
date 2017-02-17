'use strict';

require('../../spec_helper');

let braintree = specHelper.braintree;
let PaginatedResponse = require('../../../lib/braintree/paginated_response').PaginatedResponse;

describe("PaginatedResponse", () =>
  describe("nextItem", function() {
    it("only gets one page when page size and total size are the same", function(done) {
      let pagingFunction = function(currentPage, callback) {
        if (currentPage > 1) {
          return callback("too many pages requested", 1, 1, []);
        } else {
          return callback(null, 1, 1, [1]);
        }
      };

      let response = new PaginatedResponse(pagingFunction);
      return response.all(function(err, results) {
        assert.isTrue(err === null);
        return done();
      });
    });

    it("fetches collections of less than one page", function(done) {
      let pagingFunction = function(currentPage, callback) {
        if (currentPage > 1) {
          return callback("too many pages requested", 2, 5, []);
        } else {
          return callback(null, 2, 5, [1, 2]);
        }
      };

      let response = new PaginatedResponse(pagingFunction);
      return response.all(function(err, results) {
        assert.isTrue(err === null);
        assert.equal(results[0], 1);
        assert.equal(results[1], 2);
        return done();
      });
    });

    return it("fetches multiple pages", function(done) {
      let pagingFunction = function(currentPage, callback) {
        if (currentPage > 2) {
          return callback("too many pages requested", 2, 1, []);
        } else {
          return callback(null, 2, 1, [currentPage]);
        }
      };

      let response = new PaginatedResponse(pagingFunction);
      return response.all(function(err, results) {
        assert.isTrue(err === null);
        assert.equal(results[0], 1);
        assert.equal(results[1], 2);
        return done();
      });
    });
  })
);

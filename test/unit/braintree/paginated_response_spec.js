"use strict";

let PaginatedResponse =
  require("../../../lib/braintree/paginated_response").PaginatedResponse;

describe("PaginatedResponse", () =>
  describe("nextItem", function () {
    it("only gets one page when page size and total size are the same", function (done) {
      // eslint-disable-next-line func-style
      let pagingFunction = function (currentPage, callback) {
        if (currentPage > 1) {
          callback("too many pages requested", 1, 1, []);
        } else {
          callback(null, 1, 1, [1]);
        }
      };

      let response = new PaginatedResponse(pagingFunction);

      return response.all(function (err) {
        assert.isTrue(err === null);
        done();
      });
    });

    it("fetches collections of less than one page", function (done) {
      // eslint-disable-next-line func-style
      let pagingFunction = function (currentPage, callback) {
        if (currentPage > 1) {
          callback("too many pages requested", 2, 5, []);
        } else {
          callback(null, 2, 5, [1, 2]);
        }
      };

      let response = new PaginatedResponse(pagingFunction);

      return response.all(function (err, results) {
        assert.isTrue(err === null);
        assert.equal(results[0], 1);
        assert.equal(results[1], 2);
        done();
      });
    });

    it("fetches multiple pages", function (done) {
      // eslint-disable-next-line func-style
      let pagingFunction = function (currentPage, callback) {
        if (currentPage > 2) {
          callback("too many pages requested", 2, 1, []);
        } else {
          callback(null, 2, 1, [currentPage]);
        }
      };

      let response = new PaginatedResponse(pagingFunction);

      return response.all(function (err, results) {
        assert.isTrue(err === null);
        assert.equal(results[0], 1);
        assert.equal(results[1], 2);
        done();
      });
    });
  }));

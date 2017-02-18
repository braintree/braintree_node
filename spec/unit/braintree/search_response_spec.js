'use strict';

require('../../spec_helper');
let SearchResponse = require('../../../lib/braintree/search_response').SearchResponse;

describe('SearchResponse', function () {
  describe('first', function () {
    it('calls gateway#find with results', function () {
      let fakeGateway = {
        find() {
          throw new Error('This exception SHOULD be thrown');
        }
      };
      let fakeResults = {
        searchResults: {
          ids: [specHelper.randomId()]
        }
      };

      let searchResponse = new SearchResponse(fakeGateway, fakeResults);

      return assert.throws(() => searchResponse.first(), Error); // eslint-disable-line no-invalid-this
    });

    return it('does not call gateway#find with zero results', function (done) {
      let fakeGateway = {
        find() {
          throw new Error('This exception should NOT be thrown');
        }
      };
      let fakeResults = {
        searchResults: {
          ids: []
        }
      };
      let searchResponse = new SearchResponse(fakeGateway, fakeResults);

      return searchResponse.first(function () {
        assert.isTrue(true);
        return done();
      });
    });
  });

  describe('each', () =>
    it('does not call pagingFunding with zero results', function () {
      let fakePagingFunction = () => { // eslint-disable-line func-style
        throw new Error('This exception should NOT be thrown');
      };
      let fakeResults = {
        searchResults: {
          ids: []
        }
      };

      let searchResponse = new SearchResponse(fakePagingFunction, fakeResults);

      return assert.doesNotThrow(() => searchResponse.each(), Error);
    })
  );

  return describe('length', () =>
    it('returns the correct length', function () {
      let fakeResults = {
        searchResults: {
          ids: [1, 2]
        }
      };

      let searchResponse = new SearchResponse(null, fakeResults);

      return assert.equal(searchResponse.length(), 2);
    })
  );
});

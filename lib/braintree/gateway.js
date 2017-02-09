'use strict';

let ErrorResponse = require('./error_response').ErrorResponse;
let SearchResponse = require('./search_response').SearchResponse;
let exceptions = require('./exceptions');
let _ = require('underscore');

class Gateway {
  createResponseHandler(attributeKlassMap, Klass, callback) {
    return function (err, response) {
      if (err) {
        callback(err, response);
        return;
      }

      if (response.apiErrorResponse) {
        callback(null, new ErrorResponse(response.apiErrorResponse));
        return;
      }

      response.success = true;
      if (attributeKlassMap === null) {
        callback(null, response);
        return;
      } else if (typeof attributeKlassMap === 'string') {
        let attributeName = attributeKlassMap;

        if (response[attributeName]) {
          if (Klass != null) { response[attributeName] = new Klass(response[attributeName]); }
        }
        callback(null, response);
        return;
      }
      let unknown = true;

      for (let attributeName in attributeKlassMap) {
        if (!attributeKlassMap.hasOwnProperty(attributeName)) {
          continue;
        }
        Klass = attributeKlassMap[attributeName];
        if (response[attributeName]) {
          unknown = false;
          if (Klass != null) { response[attributeName] = new Klass(response[attributeName]); }
          callback(null, response);
        }
      }
      if (unknown) {
        callback(null, response);
      }
    };
  }

  createSearchResponse(url, search, pagingFunction, callback) {
    if (callback != null) {
      return this.gateway.http.post(url, {search: search.toHash()}, this.searchResponseHandler(pagingFunction, callback));
    }

    let searchResponse = new SearchResponse();

    this.gateway.http.post(url, {search: search.toHash()}, function (err, response) {
      if (err != null) {
        searchResponse.setFatalError(err);
      } else if (response.searchResults) {
        searchResponse.setResponse(response);
        searchResponse.setPagingFunction(pagingFunction);
      } else if (response.apiErrorResponse) {
        searchResponse.setFatalError(new ErrorResponse(response.apiErrorResponse));
      } else {
        searchResponse.setFatalError(exceptions.DownForMaintenanceError('Down for Maintenance')); // eslint-disable-line new-cap
      }

      return searchResponse.ready();
    });

    return searchResponse.stream;
  }

  searchResponseHandler(pagingFunction, callback) {
    return function (err, response) {
      if (err) { return callback(err, response); }
      if (response.searchResults) {
        let container = new SearchResponse(pagingFunction, response);

        return callback(null, container);
      } else if (response.apiErrorResponse) {
        return callback(null, new ErrorResponse(response.apiErrorResponse));
      }

      return callback(exceptions.DownForMaintenanceError('Down for Maintenance'), null); // eslint-disable-line new-cap
    };
  }

  pagingFunctionGenerator(search, url, SubjectType, pagedResultsKey, getSubject) {
    return (ids, callback) => {
      search.ids().in(ids);
      this.gateway.http.post(`${this.config.baseMerchantPath()}/` + url + '/advanced_search', {search: search.toHash()}, function (err, response) {
        if (err) {
          callback(err, null);
          return;
        } else if (pagedResultsKey in response) {
          if (_.isArray(getSubject(response))) {
            getSubject(response).map((subject) => {
              callback(null, new SubjectType(subject));
            });
            return;
          }

          callback(null, new SubjectType(getSubject(response)));
          return;
        }

        callback(exceptions.DownForMaintenanceError('Down for Maintenance'), null); // eslint-disable-line new-cap
      });
    };
  }
}

module.exports = {Gateway: Gateway};

"use strict";

let ErrorResponse = require("./error_response").ErrorResponse;
let SearchResponse = require("./search_response").SearchResponse;
let exceptions = require("./exceptions");

class Gateway {
  createResponseHandler(attributeKlassMap, Klass) {
    let gateway = this.gateway;

    // eslint-disable-next-line consistent-return
    return function (response) {
      if (response.apiErrorResponse) {
        return Promise.resolve(
          new ErrorResponse(response.apiErrorResponse, gateway)
        );
      }

      response.success = true;
      if (attributeKlassMap === null) {
        return Promise.resolve(response);
      } else if (typeof attributeKlassMap === "string") {
        let attributeName = attributeKlassMap;

        if (response[attributeName]) {
          if (Klass != null) {
            response[attributeName] = new Klass(
              response[attributeName],
              gateway
            );
          }
        }

        return Promise.resolve(response);
      }
      let unknown = true;

      for (let attributeName in attributeKlassMap) {
        if (!attributeKlassMap.hasOwnProperty(attributeName)) {
          continue;
        }
        Klass = attributeKlassMap[attributeName];
        if (response[attributeName]) {
          unknown = false;
          if (Klass != null) {
            response[attributeName] = new Klass(
              response[attributeName],
              gateway
            );
          }

          return Promise.resolve(response);
        }
      }
      if (unknown) {
        return Promise.resolve(response);
      }
    };
  }

  createSearchResponse(url, search, pagingFunction, callback) {
    let gateway = this.gateway;

    if (callback != null) {
      return gateway.http.post(
        url,
        { search: search.toHash() },
        this.searchResponseHandler(pagingFunction, callback)
      );
    }

    let searchResponse = new SearchResponse();

    gateway.http.post(
      url,
      { search: search.toHash() },
      function (err, response) {
        if (err != null) {
          searchResponse.setFatalError(err);
        } else if (response.searchResults) {
          searchResponse.setResponse(response);
          searchResponse.setPagingFunction(pagingFunction);
        } else if (response.apiErrorResponse) {
          searchResponse.setFatalError(
            new ErrorResponse(response.apiErrorResponse, gateway)
          );
        } else {
          searchResponse.setFatalError(
            // eslint-disable-next-line new-cap
            exceptions.UnexpectedError("Unexpected Error")
          );
        }

        return searchResponse.ready();
      }
    );

    return searchResponse.stream;
  }

  searchResponseHandler(pagingFunction, callback) {
    let gateway = this.gateway;

    return function (err, response) {
      if (err) {
        return callback(err, response);
      }
      if (response.searchResults) {
        let container = new SearchResponse(pagingFunction, response);

        return callback(null, container);
      } else if (response.apiErrorResponse) {
        return callback(
          null,
          new ErrorResponse(response.apiErrorResponse, gateway)
        );
      }

      return callback(exceptions.UnexpectedError("Unexpected Error"), null); // eslint-disable-line new-cap
    };
  }

  pagingFunctionGenerator(
    search,
    url,
    SubjectType,
    pagedResultsKey,
    getSubject
  ) {
    return (ids, callback) => {
      search.ids().in(ids);
      let gateway = this.gateway;

      gateway.http.post(
        `${this.config.baseMerchantPath()}/${url}`,
        { search: search.toHash() },
        (err, response) => {
          if (err) {
            callback(err, null);

            return;
          } else if (pagedResultsKey in response) {
            if (Array.isArray(getSubject(response))) {
              getSubject(response).forEach((subject) => {
                callback(null, new SubjectType(subject, gateway));
              });

              return;
            }

            callback(null, new SubjectType(getSubject(response), gateway));

            return;
          }

          callback(exceptions.UnexpectedError("Unexpected Error"), null); // eslint-disable-line new-cap
        }
      );
    };
  }
}

module.exports = { Gateway: Gateway };

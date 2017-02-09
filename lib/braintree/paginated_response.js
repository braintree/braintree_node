'use strict';

let PaginatedResponseStream = require('./paginated_response_stream').PaginatedResponseStream;

class PaginatedResponse {
  constructor(pagingFunction) {
    this.pagingFunction = pagingFunction;
    this.stream = new PaginatedResponseStream(this);
  }

  all(callback) {
    var results = [];

    this.stream.on('data', function (data) {
      return results.push(data);
    });
    this.stream.on('end', function () {
      return callback(null, results);
    });
    this.stream.on('error', function (err) {
      return callback(err);
    });
    return this.stream.ready();
  }

  ready() {
    return this.stream.ready();
  }
}

module.exports = {PaginatedResponse: PaginatedResponse};

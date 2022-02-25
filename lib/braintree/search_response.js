"use strict";

let SearchResponseStream =
  require("./search_response_stream").SearchResponseStream;

class SearchResponse {
  constructor(pagingFunction, results) {
    if (pagingFunction != null) {
      this.setPagingFunction(pagingFunction);
    }

    if (results != null) {
      this.setResponse(results);
    }

    this.stream = new SearchResponseStream(this);

    this.success = true;
  }

  each(callback) {
    const ids = this.ids;
    const pageSize = this.pageSize;
    const pageIndicies = [];
    let current = 0;

    while (current < ids.length) {
      pageIndicies.push(current);
      current += pageSize;
    }

    return pageIndicies.forEach((pageIndex) =>
      this.pagingFunction(ids.slice(pageIndex, pageIndex + pageSize), callback)
    );
  }

  first(callback) {
    if (this.ids.length === 0) {
      return callback(null, null);
    }

    return this.pagingFunction([this.ids[0]], callback);
  }

  length() {
    return this.ids.length;
  }

  ready() {
    return this.stream.ready();
  }

  setFatalError(error) {
    this.fatalError = error;
  }

  setResponse(results) {
    this.ids = results.searchResults.ids;
    this.pageSize = parseInt(results.searchResults.pageSize, 10);
  }

  setPagingFunction(pagingFunction) {
    this.pagingFunction = pagingFunction;
  }
}

module.exports = { SearchResponse: SearchResponse };

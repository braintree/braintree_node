"use strict";
const { Readable } = require("stream");

class PaginatedResponseStream extends Readable {
  constructor(paginatedResponse, options) {
    super({ objectMode: true });

    options = options || {};

    this.paginatedResponse = paginatedResponse;
    this.pageSize = 0;
    this.currentPage = 0;
    this.index = 0;
    this.totalItems = 0;
    this.items = [];
    this.search = options.search;
  }

  nextItem() {
    if (
      this.currentPage === 0 ||
      (this.index % this.pageSize === 0 && this.index < this.totalItems)
    ) {
      let callback = (err, totalItems, pageSize, items) => {
        if (err) {
          this.emit("error", err);

          return;
        }

        this.totalItems = totalItems;
        this.pageSize = pageSize;
        this.items = items;
        this.index++;
        this.push(this.items.shift());
      };

      this.currentPage++;

      if (this.search) {
        this.paginatedResponse.pagingFunction(
          this.currentPage,
          this.search,
          callback
        );
      } else {
        this.paginatedResponse.pagingFunction(this.currentPage, callback);
      }
    } else if (this.index >= this.totalItems) {
      this.push(null);
    } else {
      this.index++;
      this.push(this.items.shift());
    }
  }

  ready() {
    this.readyToStart = true;
    this.emit("ready");
  }

  _read() {
    if (this.readyToStart) {
      this.nextItem();
    } else {
      this.on("ready", () => this.nextItem());
    }
  }
}

module.exports = { PaginatedResponseStream };

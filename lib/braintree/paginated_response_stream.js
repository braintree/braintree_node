'use strict';

let Readable = require('stream').Readable || require('readable-stream').Readable;

class PaginatedResponseStream extends Readable {
  constructor(paginatedResponse) {
    super({objectMode: true});

    this.paginatedResponse = paginatedResponse;
    this.pageSize = 0;
    this.currentPage = 0;
    this.index = 0;
    this.totalItems = 0;
    this.items = [];
  }

  nextItem() {
    if (this.currentPage === 0 || this.index % this.pageSize === 0 && this.index < this.totalItems) {
      this.currentPage++;
      this.paginatedResponse.pagingFunction(this.currentPage, (err, totalItems, pageSize, items) => {
        if (err) {
          this.emit('error', err);
          return;
        }
        this.totalItems = totalItems;
        this.pageSize = pageSize;
        this.items = items;
        this.index++;
        this.push(this.items.shift());
      });
    } else if (this.index >= this.totalItems) {
      this.push(null);
    } else {
      this.index++;
      this.push(this.items.shift());
    }
  }

  ready() {
    this.readyToStart = true;
    this.emit('ready');
  }

  _read() {
    if (this.readyToStart) {
      this.nextItem();
    } else {
      this.on('ready', () => this.nextItem());
    }
  }
}

module.exports = {PaginatedResponseStream: PaginatedResponseStream};

"use strict";
const { Readable } = require("stream");

class SearchResponseStream extends Readable {
  constructor(searchResponse) {
    super({ objectMode: true });

    this.searchResponse = searchResponse;
    this.currentItem = 0;
    this.currentOffset = 0;
    this.bufferedResults = [];
  }

  nextItem() {
    if (this.searchResponse.fatalError != null) {
      this.emit("error", this.searchResponse.fatalError);
      this.push(null);

      return;
    } else if (this.bufferedResults.length > 0) {
      this.pushBufferedResults();

      return;
    } else if (this.currentItem >= this.searchResponse.ids.length) {
      this.push(null);

      return;
    }

    let index = 0;

    this.searchResponse.pagingFunction(
      this.searchResponse.ids.slice(
        this.currentOffset,
        this.currentOffset + this.searchResponse.pageSize
      ),
      (err, item) => {
        if (err != null) {
          this.emit("error", err);
        } else {
          this.bufferedResults.push(item);
        }

        this.currentItem += 1;
        index += 1;

        if (
          index === this.searchResponse.pageSize ||
          this.currentItem === this.searchResponse.ids.length
        ) {
          this.push(this.bufferedResults.shift());
        }
      }
    );

    this.currentOffset += this.searchResponse.pageSize;
  }

  pushBufferedResults() {
    return (() => {
      let result1 = [];

      while (this.bufferedResults.length > 0) {
        let item;
        let result = this.push(this.bufferedResults.shift());

        if (result === false) {
          break;
        }
        result1.push(item);
      }

      return result1;
    })();
  }

  ready() {
    this.readyToStart = true;

    return this.emit("ready");
  }

  _read() {
    if (this.readyToStart != null) {
      return this.nextItem();
    }

    return this.on("ready", () => {
      return this.nextItem();
    });
  }
}

module.exports = { SearchResponseStream };

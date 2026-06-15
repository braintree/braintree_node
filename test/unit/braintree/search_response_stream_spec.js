"use strict";

let sinon = require("sinon");
let {
  SearchResponseStream,
} = require("../../../lib/braintree/search_response_stream");

describe("SearchResponseStream", () => {
  let searchResponse, stream;

  beforeEach(() => {
    searchResponse = {
      ids: ["id1", "id2", "id3", "id4"],
      pageSize: 2,
      pagingFunction: function (ids, callback) {
        callback(null, { id: ids[0], data: "result" });
      },
      fatalError: null,
    };

    stream = new SearchResponseStream(searchResponse);
  });

  it("extends Readable stream", function () {
    assert.instanceOf(stream, require("stream").Readable);
  });

  it("initializes with correct properties", function () {
    assert.equal(stream.currentItem, 0);
    assert.equal(stream.currentOffset, 0);
    assert.isArray(stream.bufferedResults);
    assert.isEmpty(stream.bufferedResults);
    assert.exists(stream.searchResponse);
  });

  describe("ready", () => {
    it("sets readyToStart flag", function () {
      stream.ready();

      assert.isTrue(stream.readyToStart);
    });

    it("emits ready event", function () {
      let emitSpy = sinon.spy(stream, "emit");

      stream.ready();

      assert.isTrue(emitSpy.calledWith("ready"));

      emitSpy.restore();
    });
  });

  describe("nextItem", () => {
    it("pushes null when all items processed", function () {
      stream.currentItem = searchResponse.ids.length;

      let pushSpy = sinon.spy(stream, "push");

      stream.nextItem();

      assert.isTrue(pushSpy.calledWith(null));

      pushSpy.restore();
    });

    it("emits error when fatalError exists", function (done) {
      let error = new Error("Fatal error");

      searchResponse.fatalError = error;

      stream.on("error", (err) => {
        assert.equal(err, error);
        done();
      });

      stream.nextItem();
    });

    it("calls pagingFunction with correct slice of ids", function () {
      let pagingFunctionSpy = sinon.spy(searchResponse, "pagingFunction");

      stream.nextItem();

      assert.isTrue(pagingFunctionSpy.called);

      let callArgs = pagingFunctionSpy.firstCall.args;

      assert.deepEqual(callArgs[0], ["id1", "id2"]);

      pagingFunctionSpy.restore();
    });

    it("increments currentOffset by pageSize", function () {
      let initialOffset = stream.currentOffset;

      stream.nextItem();

      assert.equal(
        stream.currentOffset,
        initialOffset + searchResponse.pageSize
      );
    });

    it("handles paging function errors", function () {
      let error = new Error("Paging error");
      let errorHandlingSpy = sinon.spy();

      searchResponse.pagingFunction = function (ids, callback) {
        callback(error, null);
      };

      stream.on("error", errorHandlingSpy);

      stream.nextItem();

      assert.isTrue(errorHandlingSpy.called);
    });

    it("buffers results from paging function", function () {
      searchResponse.pagingFunction = function (ids, callback) {
        callback(null, { id: ids[0], data: "result" });
      };

      stream.nextItem();

      assert.isNotEmpty(stream.bufferedResults);
    });
  });

  describe("pushBufferedResults", () => {
    it("pushes all buffered results", function () {
      stream.bufferedResults = [{ id: "id1" }, { id: "id2" }];

      let pushSpy = sinon.spy(stream, "push");

      stream.pushBufferedResults();

      assert.equal(pushSpy.callCount, 2);

      pushSpy.restore();
    });

    it("empties bufferedResults array", function () {
      stream.bufferedResults = [{ id: "id1" }, { id: "id2" }];

      stream.pushBufferedResults();

      assert.isEmpty(stream.bufferedResults);
    });

    it("stops pushing if push returns false", function () {
      stream.bufferedResults = [{ id: "id1" }, { id: "id2" }, { id: "id3" }];

      let pushCount = 0;

      sinon.stub(stream, "push").callsFake(function () {
        pushCount += 1;

        return pushCount < 2;
      });

      stream.pushBufferedResults();

      assert.equal(pushCount, 2);

      stream.push.restore();
    });
  });

  describe("_read", () => {
    it("calls nextItem if readyToStart is set", function () {
      stream.readyToStart = true;

      let nextItemSpy = sinon.spy(stream, "nextItem");

      stream._read();

      assert.isTrue(nextItemSpy.called);

      nextItemSpy.restore();
    });

    it("waits for ready event if readyToStart is not set", function () {
      let onSpy = sinon.spy(stream, "on");

      stream._read();

      assert.isTrue(onSpy.calledWith("ready"));

      onSpy.restore();
    });

    it("calls nextItem after ready event fires", function () {
      let nextItemSpy = sinon.spy(stream, "nextItem");

      stream._read();
      stream.ready();

      assert.isTrue(nextItemSpy.called);

      nextItemSpy.restore();
    });
  });

  describe("integration", () => {
    it("handles empty id list", function () {
      searchResponse.ids = [];

      stream = new SearchResponseStream(searchResponse);

      let pushSpy = sinon.spy(stream, "push");

      stream.nextItem();

      assert.isTrue(pushSpy.calledWith(null));

      pushSpy.restore();
    });

    it("processes pages with multiple items", function () {
      let pagingFunctionSpy = sinon.spy(searchResponse, "pagingFunction");

      stream.nextItem();

      assert.equal(pagingFunctionSpy.callCount, 1);
      assert.equal(stream.currentOffset, 2);

      pagingFunctionSpy.restore();
    });

    it("processes all pages sequentially", function () {
      searchResponse.pageSize = 1;

      let pagingCalls = [];

      searchResponse.pagingFunction = function (ids, callback) {
        pagingCalls.push(ids);
        callback(null, { data: ids[0] });
      };

      stream = new SearchResponseStream(searchResponse);

      stream.nextItem();

      assert.deepEqual(pagingCalls[0], ["id1"]);
      assert.equal(stream.currentOffset, 1);
    });
  });
});

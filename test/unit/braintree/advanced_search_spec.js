'use strict';

let TestSearch = require('../../../test/test-search');

let newSearch = () => new TestSearch(); // eslint-disable-line func-style
let value = 'mail@example.com';

describe('AdvancedSearch', function () {
  describe('equality field', function () {
    it('supports is', function () {
      let search = newSearch();

      search.equality().is(value);
      assert.deepEqual(search.toHash(), {equality: {is: value}});
    });

    it('supports isNot', function () {
      let search = newSearch();

      search.equality().isNot(value);
      assert.deepEqual(search.toHash(), {equality: {isNot: value}});
    });
  });

  describe('partial match field', function () {
    it('inherits operators', function () {
      let search = newSearch();

      assert.isFunction(search.partialMatch().is);
      assert.isFunction(search.partialMatch().isNot);
    });

    it('supports endsWith', function () {
      let search = newSearch();

      search.partialMatch().endsWith('example.com');
      assert.deepEqual(search.toHash(), {partialMatch: {endsWith: 'example.com'}});
    });

    it('supports startsWith', function () {
      let search = newSearch();

      search.partialMatch().startsWith('mail');
      assert.deepEqual(search.toHash(), {partialMatch: {startsWith: 'mail'}});
    });
  });

  describe('text field', function () {
    it('inherits operators', function () {
      let search = newSearch();

      assert.isFunction(search.text().is);
      assert.isFunction(search.text().isNot);
      assert.isFunction(search.text().endsWith);
      assert.isFunction(search.text().startsWith);
    });

    it('supports contains', function () {
      let search = newSearch();

      search.text().contains('ample');
      assert.deepEqual(search.toHash(), {text: {contains: 'ample'}});
    });
  });

  describe('key value field', () =>
    it('supports is', function () {
      let search = newSearch();

      search.key().is(100);
      assert.deepEqual(search.toHash(), {key: 100});
    })
  );

  describe('multiple value field', function () {
    it('supports in', function () {
      let search = newSearch();

      search.multiple().in([1, 2, 3]);
      assert.deepEqual(search.toHash(), {multiple: [1, 2, 3]});
    });

    it('supports in with an allowed value', function () {
      let search = newSearch();

      assert.doesNotThrow(() => search.multipleWithAllows().in(['Hello']), Error);
    });

    it('supports in with an unallowed value', function () {
      let search = newSearch();

      assert.throws(() => search.multipleWithAllows().in(['Hello', 'Bah']), Error);
    });

    it('supports is', function () {
      let search = newSearch();

      search.multiple().is(value);
      assert.deepEqual(search.toHash(), {multiple: [value]});
    });
  });

  describe('multiple value or text field', function () {
    it('inherits operators', function () {
      let search = newSearch();

      assert.isFunction(search.multipleValueOrText().is);
      assert.isFunction(search.multipleValueOrText().isNot);
      assert.isFunction(search.multipleValueOrText().endsWith);
      assert.isFunction(search.multipleValueOrText().startsWith);
      assert.isFunction(search.multipleValueOrText().contains);
      assert.isFunction(search.multipleValueOrText().in);
    });

    it('delegates is to TextNode', function () {
      let search = newSearch();

      search.multipleValueOrText().is(value);
      assert.deepEqual(search.toHash(), {multipleValueOrText: {is: value}});
    });
  });

  describe('range field', function () {
    it('supports is', function () {
      let search = newSearch();

      search.range().is(value);
      assert.deepEqual(search.toHash(), {range: {is: value}});
    });

    it('supports min', function () {
      let search = newSearch();

      search.range().min(50);
      assert.deepEqual(search.toHash(), {range: {min: 50}});
    });

    it('supports max', function () {
      let search = newSearch();

      search.range().max(100);
      assert.deepEqual(search.toHash(), {range: {max: 100}});
    });

    it('supports between', function () {
      let search = newSearch();

      search.range().between(50, 100);
      assert.deepEqual(search.toHash(), {range: {min: 50, max: 100}});
    });
  });

  describe('addCriteria', function () {
    it('adds a numeric criteria', function () {
      let search = newSearch();

      search.addCriteria('numero', 2);
      assert.deepEqual(search.toHash(), {numero: 2});
    });

    it('merges in an object criteria', function () {
      let search = newSearch();

      search.addCriteria('object', {foo: 'bar', key1: 1});
      search.addCriteria('object', {foo: 'baz', key2: 2});
      assert.deepEqual(search.toHash(), {object: {foo: 'baz', key1: 1, key2: 2}});
    });

    it('replaces an array criteria', function () {
      let search = newSearch();

      search.addCriteria('array', [0, 1, 2]);
      search.addCriteria('array', [3, 4]);
      assert.deepEqual(search.toHash(), {array: [3, 4]});
    });
  });
});


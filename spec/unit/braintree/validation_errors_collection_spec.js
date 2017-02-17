'use strict';

require('../../spec_helper');
let ValidationErrorsCollection = require('../../../lib/braintree/validation_errors_collection').ValidationErrorsCollection;

describe("ValidationErrorsCollection", () =>
  describe("on", () =>
    it("allows accessing errors", function() {
      let result = new ValidationErrorsCollection({
        errors: [
          {attribute: 'foo', code: '1'},
          {attribute: 'foo', code: '2'}
        ]
      });

      assert.equal(result.on('foo').length, 2);
      assert.equal(result.on('foo')[0].code, '1');
      return assert.equal(result.on('foo')[1].code, '2');
    })
  )
);

"use strict";

let ErrorTypes = require("../../../lib/braintree/error_types").errorTypes;

describe("TransactionLineItemGateway", function () {
  describe("findAll", function () {
    it("returns an error if the transaction is not found", function (done) {
      let nonExistingTransactionId = "willnotbefound";

      specHelper.defaultGateway.transactionLineItem.findAll(
        nonExistingTransactionId,
        function (err) {
          assert.equal(err.type, ErrorTypes.notFoundError);
          done();
        }
      );
    });
  });
});

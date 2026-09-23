"use strict";

let TransactionSearch =
  require("../../../lib/braintree/transaction_search").TransactionSearch;
let Transaction = require("../../../lib/braintree/transaction").Transaction;
let Util = require("../../../lib/braintree/util").Util;

let newSearch = () => new TransactionSearch(); // eslint-disable-line func-style

describe("TransactionSearch", function () {
  describe("achType", function () {
    it("serializes same_day to the ach_type wire key", function () {
      let search = newSearch();

      search.achType().is(Transaction.AchType.SameDay);
      assert.deepEqual(Util.convertObjectKeysToUnderscores(search.toHash()), {
        ach_type: ["same_day"], // eslint-disable-line camelcase
      });
    });

    it("serializes standard to the ach_type wire key", function () {
      let search = newSearch();

      search.achType().is(Transaction.AchType.Standard);
      assert.deepEqual(Util.convertObjectKeysToUnderscores(search.toHash()), {
        ach_type: ["standard"], // eslint-disable-line camelcase
      });
    });

    it("serializes both values to the ach_type wire key", function () {
      let search = newSearch();

      search
        .achType()
        .in([Transaction.AchType.SameDay, Transaction.AchType.Standard]);
      assert.deepEqual(Util.convertObjectKeysToUnderscores(search.toHash()), {
        ach_type: ["same_day", "standard"], // eslint-disable-line camelcase
      });
    });

    it("rejects values not in the allowed list", function () {
      let search = newSearch();

      assert.throws(() => search.achType().in(["not_a_valid_value"]), Error);
    });
  });
});

"use strict";

let Disbursement = require("../../../lib/braintree/disbursement").Disbursement;

describe("Disbursement", function () {
  describe("isDebit", function () {
    it("returns true if the type is debit", () => {
      let attrs = {
        amount: 5.0,
        disbursementType: "debit",
      };

      let disbursement = new Disbursement(attrs);

      assert.equal(true, disbursement.isDebit());
    });

    it("returns false if the type is not debit", () => {
      let attrs = {
        amount: 5.0,
        disbursementType: "other",
      };

      let disbursement = new Disbursement(attrs);

      assert.equal(false, disbursement.isDebit());
    });
  });

  describe("isCredit", function () {
    it("returns true if the type is credit", () => {
      let attrs = {
        amount: 5.0,
        disbursementType: "credit",
      };

      let disbursement = new Disbursement(attrs);

      assert.equal(true, disbursement.isCredit());
    });

    it("returns false if the type is not credit", () => {
      let attrs = {
        amount: 5.0,
        disbursementType: "other",
      };

      let disbursement = new Disbursement(attrs);

      assert.equal(false, disbursement.isCredit());
    });
  });
});

"use strict";
/* eslint-disable camelcase */

let RiskData = require("../../../lib/braintree/risk_data").RiskData;

describe("RiskData", () => {
  describe("constructor", () => {
    it("initializes with liability shift information", function () {
      let data = new RiskData({
        decision: "it is decided",
        decisionReasons: ["foo"],
        deviceDataCaptured: true,
        fraudServiceProvider: "paypal",
        id: "123",
        transactionRiskScore: "42",
        liabilityShift: {
          responsibleParty: "paypal",
          conditions: ["unauthorized", "item_not_received"],
        },
      });

      assert.equal("it is decided", data.decision);
      assert.equal("foo", data.decisionReasons[0]);
      assert.isTrue(data.deviceDataCaptured);
      assert.equal("paypal", data.fraudServiceProvider);
      assert.equal("123", data.id);
      assert.equal("42", data.transactionRiskScore);
      assert.equal("paypal", data.liabilityShift.responsibleParty);
      assert.deepEqual(
        ["unauthorized", "item_not_received"],
        data.liabilityShift.conditions
      );
    });

    it("initializes without liability shift information", function () {
      let data = new RiskData({
        decision: "it is decided",
        decisionReasons: ["foo"],
        deviceDataCaptured: true,
        fraudServiceProvider: "paypal",
        id: "123",
        transactionRiskScore: "42",
      });

      assert.equal("it is decided", data.decision);
      assert.equal("foo", data.decisionReasons[0]);
      assert.isTrue(data.deviceDataCaptured);
      assert.equal("paypal", data.fraudServiceProvider);
      assert.equal("123", data.id);
      assert.equal("42", data.transactionRiskScore);
      assert.isUndefined(data.liabilityShift);
    });
  });
});

"use strict";

let sinon = require("sinon");
let {
  SettlementBatchSummaryGateway,
} = require("../../../lib/braintree/settlement_batch_summary_gateway");
let {
  SettlementBatchSummary,
} = require("../../../lib/braintree/settlement_batch_summary");

describe("SettlementBatchSummaryGateway", () => {
  let gateway, fakeGateway;

  beforeEach(() => {
    fakeGateway = {
      config: {
        baseMerchantPath: () => "/merchants/test_merchant",
      },
      http: {
        post: sinon.stub().resolves({
          settlementBatchSummary: {
            records: [],
          },
        }),
      },
    };

    gateway = new SettlementBatchSummaryGateway(fakeGateway);
  });

  describe("generate", () => {
    it("posts to settlement_batch_summary endpoint", function () {
      let criteria = {
        settlementDate: "2024-01-01",
      };

      gateway.generate(criteria);

      assert.isTrue(fakeGateway.http.post.called);
      assert.include(
        fakeGateway.http.post.firstCall.args[0],
        "settlement_batch_summary"
      );
    });

    it("wraps criteria in settlementBatchSummary key", function () {
      let criteria = {
        settlementDate: "2024-01-01",
      };

      gateway.generate(criteria);

      let requestBody = fakeGateway.http.post.firstCall.args[1];

      assert.deepEqual(requestBody, {
        settlementBatchSummary: criteria,
      });
    });

    it("returns settlement batch summary data", function () {
      fakeGateway.http.post.resolves({
        settlementBatchSummary: {
          records: [
            {
              amount: "100.00",
              count: 1,
            },
          ],
        },
      });

      return gateway
        .generate({ settlementDate: "2024-01-01" })
        .then((response) => {
          assert.exists(response);
        });
    });
  });

  describe("responseHandler", () => {
    it("returns a response handler function", function () {
      let criteria = {
        settlementDate: "2024-01-01",
      };

      let handler = gateway.responseHandler(criteria);

      assert.isFunction(handler);
    });

    it("calls createResponseHandler with settlementBatchSummary", function () {
      let createResponseHandlerSpy = sinon.spy(
        gateway,
        "createResponseHandler"
      );

      let criteria = {
        settlementDate: "2024-01-01",
      };

      gateway.responseHandler(criteria);

      assert.isTrue(createResponseHandlerSpy.called);
      assert.equal(
        createResponseHandlerSpy.firstCall.args[0],
        "settlementBatchSummary"
      );

      createResponseHandlerSpy.restore();
    });

    it("calls createResponseHandler with SettlementBatchSummary class", function () {
      let createResponseHandlerSpy = sinon.spy(
        gateway,
        "createResponseHandler"
      );

      let criteria = {
        settlementDate: "2024-01-01",
      };

      gateway.responseHandler(criteria);

      assert.isTrue(createResponseHandlerSpy.called);
      assert.equal(
        createResponseHandlerSpy.firstCall.args[1],
        SettlementBatchSummary
      );

      createResponseHandlerSpy.restore();
    });
  });

  describe("underscoreCustomField", () => {
    it("returns response unchanged when success is false", function () {
      let criteria = {
        groupByCustomField: "custom_field",
      };

      let response = {
        success: false,
        settlementBatchSummary: {
          records: [
            {
              customField: "value",
            },
          ],
        },
      };

      let result = gateway.underscoreCustomField(criteria, response);

      assert.deepEqual(result, response);
      assert.exists(result.settlementBatchSummary.records[0].customField);
    });

    it("returns response unchanged when no groupByCustomField in criteria", function () {
      let criteria = {
        settlementDate: "2024-01-01",
      };

      let response = {
        success: true,
        settlementBatchSummary: {
          records: [
            {
              amount: "100.00",
            },
          ],
        },
      };

      let result = gateway.underscoreCustomField(criteria, response);

      assert.deepEqual(result, response);
    });

    it("returns response unchanged for custom field without underscore", function () {
      let criteria = {
        groupByCustomField: "customfield",
      };

      let response = {
        success: true,
        settlementBatchSummary: {
          records: [
            {
              customfield: "value",
            },
          ],
        },
      };

      let result = gateway.underscoreCustomField(criteria, response);

      assert.deepEqual(result, response);
      assert.exists(result.settlementBatchSummary.records[0].customfield);
    });

    it("transforms camelCase custom field back to snake_case", function () {
      let criteria = {
        groupByCustomField: "custom_field",
      };

      let response = {
        success: true,
        settlementBatchSummary: {
          records: [
            {
              customField: "value1",
              amount: "100.00",
            },
            {
              customField: "value2",
              amount: "200.00",
            },
          ],
        },
      };

      let result = gateway.underscoreCustomField(criteria, response);

      assert.exists(result.settlementBatchSummary.records[0].custom_field);
      assert.equal(
        result.settlementBatchSummary.records[0].custom_field,
        "value1"
      );
      assert.notExists(result.settlementBatchSummary.records[0].customField);
    });

    it("transforms all records in settlement batch summary", function () {
      let criteria = {
        groupByCustomField: "merchant_custom_field",
      };

      let response = {
        success: true,
        settlementBatchSummary: {
          records: [
            {
              merchantCustomField: "value1",
              amount: "100.00",
            },
            {
              merchantCustomField: "value2",
              amount: "200.00",
            },
            {
              merchantCustomField: "value3",
              amount: "300.00",
            },
          ],
        },
      };

      let result = gateway.underscoreCustomField(criteria, response);

      assert.equal(result.settlementBatchSummary.records.length, 3);
      assert.exists(
        result.settlementBatchSummary.records[0].merchant_custom_field
      );
      assert.exists(
        result.settlementBatchSummary.records[1].merchant_custom_field
      );
      assert.exists(
        result.settlementBatchSummary.records[2].merchant_custom_field
      );
      assert.notExists(
        result.settlementBatchSummary.records[0].merchantCustomField
      );
    });

    it("preserves other record properties during transformation", function () {
      let criteria = {
        groupByCustomField: "custom_field",
      };

      let response = {
        success: true,
        settlementBatchSummary: {
          records: [
            {
              customField: "value",
              amount: "100.00",
              count: 5,
              merchantName: "Test Merchant",
            },
          ],
        },
      };

      let result = gateway.underscoreCustomField(criteria, response);

      assert.equal(result.settlementBatchSummary.records[0].amount, "100.00");
      assert.equal(result.settlementBatchSummary.records[0].count, 5);
      assert.equal(
        result.settlementBatchSummary.records[0].merchantName,
        "Test Merchant"
      );
    });

    it("handles multiple underscores in custom field name", function () {
      let criteria = {
        groupByCustomField: "my_custom_field_name",
      };

      let response = {
        success: true,
        settlementBatchSummary: {
          records: [
            {
              myCustomFieldName: "value",
            },
          ],
        },
      };

      let result = gateway.underscoreCustomField(criteria, response);

      assert.exists(
        result.settlementBatchSummary.records[0].my_custom_field_name
      );
      assert.equal(
        result.settlementBatchSummary.records[0].my_custom_field_name,
        "value"
      );
    });

    it("returns response object for chaining", function () {
      let criteria = {
        groupByCustomField: "custom_field",
      };

      let response = {
        success: true,
        settlementBatchSummary: {
          records: [],
        },
      };

      let result = gateway.underscoreCustomField(criteria, response);

      assert.equal(result, response);
    });

    it("handles empty records array", function () {
      let criteria = {
        groupByCustomField: "custom_field",
      };

      let response = {
        success: true,
        settlementBatchSummary: {
          records: [],
        },
      };

      let result = gateway.underscoreCustomField(criteria, response);

      assert.isArray(result.settlementBatchSummary.records);
      assert.isEmpty(result.settlementBatchSummary.records);
    });
  });
});

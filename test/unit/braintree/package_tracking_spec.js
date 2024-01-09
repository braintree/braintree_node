"use strict";

const { assert } = require("chai");

let TransactionGateway =
  require("../../../lib/braintree/transaction_gateway").TransactionGateway;

describe("package tracking unit tests", function () {
  let fakeGateway = {
    config: {
      baseMerchantPath() {
        return "";
      },
    },
    http: {
      post(url, params) {
        return Promise.resolve(params);
      },
    },
  };
  const transactionId = "abc123";

  it("should successfully create a package tracking request with valid attributes", async () => {
    const attributes = {
      carrier: "UPS",
      lineItems: [
        {
          productCode: "ABC 01",
          quantity: "1",
          name: "Best Product Ever",
          description: "Best Description Ever",
          imageUrl: "http://example.com",
          upcCode: "51234567890",
          upcType: "UPC-A",
        },
        {
          productCode: "ABC 02",
          quantity: "1",
          name: "Best Product Ever",
          description: "Best Description Ever",
          imageUrl: "http://example.com",
          upcCode: "51234567890",
          upcType: "UPC-A",
        },
      ],
      notifyPayer: true,
      trackingNumber: "123456",
    };

    let transactionGateway = new TransactionGateway(fakeGateway);

    const response = await transactionGateway.packageTracking(
      transactionId,
      attributes
    );

    assert.isTrue(response.success);
  });

  it("should not create request with invalid attributes", async () => {
    const attributes = {
      invalid: "garbge",
      random: "still invalid",
      carrier: "UPS",
      notifyPayer: true,
      trackingNumber: "123456",
    };
    let transactionGateway = new TransactionGateway(fakeGateway);

    try {
      await transactionGateway.packageTracking(transactionId, attributes);
    } catch (err) {
      assert.equal(err.message, "These keys are invalid: invalid, random");
    }
  });
});

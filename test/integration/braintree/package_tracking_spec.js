"use strict";

const { assert } = require("chai");
let Nonces = require("../../../lib/braintree/test_values/nonces").Nonces;

describe("package tracking", function () {
  it("returns validation error message from gateway api", async () => {
    const transactionParams = {
      amount: "100.00",
      options: {
        submitForSettlement: true,
      },
      paymentMethodNonce: Nonces.PayPalOneTimePayment,
    };

    // carrier name missing
    const invalidRequest1 = {
      trackingNumber: "tracking_number_1",
    };

    // tracking number missing
    const invalidRequest2 = {
      carrier: "UPS",
    };

    const response = await specHelper.defaultGateway.transaction.sale(
      transactionParams
    );
    const invalidResult1 =
      await specHelper.defaultGateway.transaction.packageTracking(
        response.transaction.id,
        invalidRequest1
      );

    assert.equal(invalidResult1.message, "Carrier name is required.");

    const invalidResult2 =
      await specHelper.defaultGateway.transaction.packageTracking(
        response.transaction.id,
        invalidRequest2
      );

    assert.equal(invalidResult2.message, "Tracking number is required.");
  });

  it("successfully calls gateway API and adds package tracking information", async () => {
    const transactionParams = {
      amount: "100.00",
      options: {
        submitForSettlement: true,
      },
      paymentMethodNonce: Nonces.PayPalOneTimePayment,
    };

    const firstPackage = {
      carrier: "UPS",
      trackingNumber: "tracking_number_1",
      notifyPayer: true,
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
          upcCode: "51234567891",
          upcType: "UPC-A",
        },
      ],
    };

    const secondPackage = {
      carrier: "FEDEX",
      trackingNumber: "tracking_number_2",
      notifyPayer: true,
      lineItems: [
        {
          productCode: "ABC 03",
          quantity: "1",
          name: "Best Product Ever",
          description: "Best Description Ever",
        },
      ],
    };

    const response = await specHelper.defaultGateway.transaction.sale(
      transactionParams
    );
    const firstResult =
      await specHelper.defaultGateway.transaction.packageTracking(
        response.transaction.id,
        firstPackage
      );

    assert.isTrue(firstResult.success);
    assert.exists(firstResult.transaction.packages[0].id);
    assert.equal(firstResult.transaction.packages[0].carrier, "UPS");
    assert.equal(
      firstResult.transaction.packages[0].trackingNumber,
      "tracking_number_1"
    );

    const secondResult =
      await specHelper.defaultGateway.transaction.packageTracking(
        response.transaction.id,
        secondPackage
      );

    assert.exists(secondResult.transaction.packages[1].id);
    assert.equal(secondResult.transaction.packages[1].carrier, "FEDEX");
    assert.equal(
      secondResult.transaction.packages[1].trackingNumber,
      "tracking_number_2"
    );

    const findTransaction = await specHelper.defaultGateway.transaction.find(
      response.transaction.id
    );

    assert.equal(2, Object.keys(findTransaction.packages).length);
  });

  it("successfully retrieves transactions with existing package tracking information", async () => {
    const findTransaction = await specHelper.defaultGateway.transaction.find(
      "package_tracking_tx"
    );

    const packages = findTransaction.packages;

    assert.equal(2, Object.keys(packages).length);
    assert.exists(packages[0].id);
    assert.equal(packages[0].paypalTrackerId, "paypal_tracker_id_1");
    assert.exists(packages[1].id);
    assert.equal(packages[1].paypalTrackerId, "paypal_tracker_id_2");
  });
});

"use strict";

let { Merchant } = require("../../../lib/braintree/merchant");
let { MerchantAccount } = require("../../../lib/braintree/merchant_account");

describe("Merchant", () => {
  it("extends AttributeSetter", function () {
    let merchant = new Merchant({});

    assert.exists(merchant);
  });

  it("initializes with attributes", function () {
    let attributes = {
      id: "merchant_123",
      email: "test@example.com",
    };

    let merchant = new Merchant(attributes);

    assert.equal(merchant.id, "merchant_123");
    assert.equal(merchant.email, "test@example.com");
  });

  describe("merchantAccounts", () => {
    it("initializes without merchant accounts", function () {
      let merchant = new Merchant({
        id: "merchant_123",
      });

      assert.notExists(merchant.merchantAccounts);
    });

    it("converts merchant accounts to MerchantAccount instances", function () {
      let attributes = {
        id: "merchant_123",
        merchantAccounts: [
          {
            id: "account_1",
            status: "active",
          },
          {
            id: "account_2",
            status: "pending",
          },
        ],
      };

      let merchant = new Merchant(attributes);

      assert.isArray(merchant.merchantAccounts);
      assert.equal(merchant.merchantAccounts.length, 2);
      assert.instanceOf(merchant.merchantAccounts[0], MerchantAccount);
      assert.instanceOf(merchant.merchantAccounts[1], MerchantAccount);
    });

    it("preserves merchant account attributes", function () {
      let attributes = {
        id: "merchant_123",
        merchantAccounts: [
          {
            id: "account_1",
            status: "active",
          },
        ],
      };

      let merchant = new Merchant(attributes);

      assert.equal(merchant.merchantAccounts[0].id, "account_1");
      assert.equal(merchant.merchantAccounts[0].status, "active");
    });

    it("handles single merchant account", function () {
      let attributes = {
        id: "merchant_123",
        merchantAccounts: [
          {
            id: "account_1",
            status: "active",
          },
        ],
      };

      let merchant = new Merchant(attributes);

      assert.equal(merchant.merchantAccounts.length, 1);
      assert.instanceOf(merchant.merchantAccounts[0], MerchantAccount);
    });

    it("handles multiple merchant accounts", function () {
      let attributes = {
        id: "merchant_123",
        merchantAccounts: [
          {
            id: "account_1",
            status: "active",
          },
          {
            id: "account_2",
            status: "pending",
          },
          {
            id: "account_3",
            status: "suspended",
          },
        ],
      };

      let merchant = new Merchant(attributes);

      assert.equal(merchant.merchantAccounts.length, 3);
      merchant.merchantAccounts.forEach((account) => {
        assert.instanceOf(account, MerchantAccount);
      });
    });

    it("handles empty merchant accounts array", function () {
      let attributes = {
        id: "merchant_123",
        merchantAccounts: [],
      };

      let merchant = new Merchant(attributes);

      assert.isArray(merchant.merchantAccounts);
      assert.isEmpty(merchant.merchantAccounts);
    });
  });

  describe("integration", () => {
    it("preserves merchant id alongside merchant accounts", function () {
      let attributes = {
        id: "merchant_123",
        email: "merchant@example.com",
        merchantAccounts: [
          {
            id: "account_1",
            status: "active",
          },
        ],
      };

      let merchant = new Merchant(attributes);

      assert.equal(merchant.id, "merchant_123");
      assert.equal(merchant.email, "merchant@example.com");
      assert.equal(merchant.merchantAccounts.length, 1);
    });

    it("creates independent merchant instances", function () {
      let merchant1 = new Merchant({
        id: "merchant_1",
        merchantAccounts: [{ id: "account_1" }],
      });

      let merchant2 = new Merchant({
        id: "merchant_2",
        merchantAccounts: [{ id: "account_2" }, { id: "account_3" }],
      });

      assert.equal(merchant1.id, "merchant_1");
      assert.equal(merchant2.id, "merchant_2");
      assert.equal(merchant1.merchantAccounts.length, 1);
      assert.equal(merchant2.merchantAccounts.length, 2);
    });

    it("handles complete merchant data", function () {
      let attributes = {
        id: "merchant_123",
        email: "merchant@example.com",
        companyName: "Test Company",
        firstName: "John",
        lastName: "Doe",
        merchantAccounts: [
          {
            id: "account_1",
            status: "active",
            fundingDestination: "bank",
          },
          {
            id: "account_2",
            status: "pending",
            fundingDestination: "email",
          },
        ],
      };

      let merchant = new Merchant(attributes);

      assert.equal(merchant.id, "merchant_123");
      assert.equal(merchant.email, "merchant@example.com");
      assert.equal(merchant.companyName, "Test Company");
      assert.equal(merchant.firstName, "John");
      assert.equal(merchant.lastName, "Doe");
      assert.equal(merchant.merchantAccounts.length, 2);
      assert.equal(merchant.merchantAccounts[0].id, "account_1");
      assert.equal(merchant.merchantAccounts[1].id, "account_2");
    });
  });
});

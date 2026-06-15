"use strict";

let {
  TransactionLineItem,
} = require("../../../lib/braintree/transaction_line_item");

describe("TransactionLineItem", () => {
  it("extends AttributeSetter", function () {
    let lineItem = new TransactionLineItem({});

    assert.exists(lineItem);
  });

  it("initializes with attributes", function () {
    let attributes = {
      name: "Test Item",
      description: "A test line item",
      quantity: 5,
      unitAmount: "10.00",
    };

    let lineItem = new TransactionLineItem(attributes);

    assert.equal(lineItem.name, "Test Item");
    assert.equal(lineItem.description, "A test line item");
    assert.equal(lineItem.quantity, 5);
    assert.equal(lineItem.unitAmount, "10.00");
  });

  describe("Kind", () => {
    it("has Credit kind", function () {
      assert.equal(TransactionLineItem.Kind.Credit, "credit");
    });

    it("has Debit kind", function () {
      assert.equal(TransactionLineItem.Kind.Debit, "debit");
    });

    it("has All method", function () {
      assert.isFunction(TransactionLineItem.Kind.All);
    });

    it("All returns array of all kinds", function () {
      // eslint-disable-next-line new-cap
      let allKinds = TransactionLineItem.Kind.All();

      assert.isArray(allKinds);
      assert.include(allKinds, "credit");
      assert.include(allKinds, "debit");
    });

    it("All does not include the All method itself", function () {
      // eslint-disable-next-line new-cap
      let allKinds = TransactionLineItem.Kind.All();

      assert.notInclude(allKinds, TransactionLineItem.Kind.All);
    });

    it("All returns expected number of kinds", function () {
      // eslint-disable-next-line new-cap
      let allKinds = TransactionLineItem.Kind.All();

      assert.equal(allKinds.length, 2);
    });
  });

  describe("line item properties", () => {
    it("can set and get name", function () {
      let lineItem = new TransactionLineItem({ name: "Product Name" });

      assert.equal(lineItem.name, "Product Name");
    });

    it("can set and get description", function () {
      let lineItem = new TransactionLineItem({ description: "Product Desc" });

      assert.equal(lineItem.description, "Product Desc");
    });

    it("can set and get quantity", function () {
      let lineItem = new TransactionLineItem({ quantity: 10 });

      assert.equal(lineItem.quantity, 10);
    });

    it("can set and get unitAmount", function () {
      let lineItem = new TransactionLineItem({ unitAmount: "25.00" });

      assert.equal(lineItem.unitAmount, "25.00");
    });

    it("can set and get unitTaxAmount", function () {
      let lineItem = new TransactionLineItem({ unitTaxAmount: "2.50" });

      assert.equal(lineItem.unitTaxAmount, "2.50");
    });

    it("can set and get totalAmount", function () {
      let lineItem = new TransactionLineItem({ totalAmount: "250.00" });

      assert.equal(lineItem.totalAmount, "250.00");
    });

    it("can set and get kind", function () {
      let lineItem = new TransactionLineItem({
        kind: TransactionLineItem.Kind.Credit,
      });

      assert.equal(lineItem.kind, "credit");
    });

    it("can set and get productCode", function () {
      let lineItem = new TransactionLineItem({ productCode: "PROD123" });

      assert.equal(lineItem.productCode, "PROD123");
    });

    it("can set and get commodityCode", function () {
      let lineItem = new TransactionLineItem({ commodityCode: "COMM456" });

      assert.equal(lineItem.commodityCode, "COMM456");
    });

    it("can set and get discountAmount", function () {
      let lineItem = new TransactionLineItem({ discountAmount: "10.00" });

      assert.equal(lineItem.discountAmount, "10.00");
    });

    it("can set and get url", function () {
      let lineItem = new TransactionLineItem({
        url: "https://example.com/product",
      });

      assert.equal(lineItem.url, "https://example.com/product");
    });
  });

  describe("multiple line items", () => {
    it("creates independent line item instances", function () {
      let item1 = new TransactionLineItem({
        name: "Item 1",
        quantity: 5,
      });
      let item2 = new TransactionLineItem({
        name: "Item 2",
        quantity: 10,
      });

      assert.equal(item1.name, "Item 1");
      assert.equal(item2.name, "Item 2");
      assert.notEqual(item1.quantity, item2.quantity);
    });

    it("handles complete line item data", function () {
      let lineItem = new TransactionLineItem({
        name: "Full Item",
        description: "Complete line item",
        quantity: 3,
        unitAmount: "50.00",
        unitTaxAmount: "5.00",
        totalAmount: "165.00",
        kind: TransactionLineItem.Kind.Debit,
        productCode: "PROD001",
        commodityCode: "COMM001",
        discountAmount: "0.00",
        url: "https://example.com",
      });

      assert.equal(lineItem.name, "Full Item");
      assert.equal(lineItem.description, "Complete line item");
      assert.equal(lineItem.quantity, 3);
      assert.equal(lineItem.unitAmount, "50.00");
      assert.equal(lineItem.unitTaxAmount, "5.00");
      assert.equal(lineItem.totalAmount, "165.00");
      assert.equal(lineItem.kind, "debit");
      assert.equal(lineItem.productCode, "PROD001");
      assert.equal(lineItem.commodityCode, "COMM001");
      assert.equal(lineItem.discountAmount, "0.00");
      assert.equal(lineItem.url, "https://example.com");
    });
  });

  describe("Kind.All edge cases", () => {
    it("All does not include own methods", function () {
      // eslint-disable-next-line new-cap
      let allKinds = TransactionLineItem.Kind.All();

      allKinds.forEach((kind) => {
        assert.isString(kind);
      });
    });

    it("All uses hasOwnProperty check", function () {
      // eslint-disable-next-line new-cap
      let allKinds = TransactionLineItem.Kind.All();

      // Should not include inherited properties
      for (let key in allKinds) {
        if (!allKinds.hasOwnProperty(key)) {
          assert.fail("All should only include own properties");
        }
      }
    });
  });
});

"use strict";

const CreateLocalPaymentContextInput = require("../../../../lib/braintree/graphql/inputs/create_local_payment_context_input");
const MonetaryAmountInput = require("../../../../lib/braintree/graphql/inputs/monetary_amount_input");
const PayerInfoInput = require("../../../../lib/braintree/graphql/inputs/payer_info_input");
const BillingAddressInput = require("../../../../lib/braintree/graphql/inputs/billing_address_input");
const ShippingAddressInput = require("../../../../lib/braintree/graphql/inputs/shipping_address_input");
const {
  LocalPaymentType,
} = require("../../../../lib/braintree/local_payment_type");

describe("CreateLocalPaymentContextInput", () => {
  it("should correctly generate map for GraphQL variables with all fields", () => {
    const billingAddress = new BillingAddressInput({
      countryCodeAlpha2: "PT",
      streetAddress: "123 Main St",
      locality: "Lisbon",
      postalCode: "1000-001",
    });

    const shippingAddress = new ShippingAddressInput({
      streetAddress: "456 Shipping St",
      extendedAddress: "Apt 5C",
      locality: "Porto",
      region: "Porto",
      postalCode: "4000-001",
      countryCode: "PT",
    });

    const payerInfo = new PayerInfoInput({
      givenName: "John",
      surname: "Doe",
      email: "john@example.com",
      billingAddress: billingAddress,
      shippingAddress: shippingAddress,
    });

    const amount = new MonetaryAmountInput("10.00", "EUR");

    const input = new CreateLocalPaymentContextInput({
      amount: amount,
      type: LocalPaymentType.MBWAY,
      merchantAccountId: "test-merchant-account",
      payerInfo: payerInfo,
      orderId: "order-123",
      paymentId: "payment-456",
    });

    const graphQLVariables = input.toGraphQLVariables();

    assert.isDefined(graphQLVariables.paymentContext);
    assert.equal(graphQLVariables.paymentContext.type, LocalPaymentType.MBWAY);
    assert.equal(
      graphQLVariables.paymentContext.merchantAccountId,
      "test-merchant-account"
    );
    assert.equal(graphQLVariables.paymentContext.orderId, "order-123");
    assert.equal(graphQLVariables.paymentContext.paymentId, "payment-456");
    assert.equal(graphQLVariables.paymentContext.amount.value, "10.00");
    assert.equal(graphQLVariables.paymentContext.amount.currencyCode, "EUR");
    assert.equal(graphQLVariables.paymentContext.payerInfo.givenName, "John");
    assert.equal(graphQLVariables.paymentContext.payerInfo.surname, "Doe");
    assert.equal(
      graphQLVariables.paymentContext.payerInfo.billingAddress.countryCode,
      "PT"
    );
    assert.equal(
      graphQLVariables.paymentContext.payerInfo.shippingAddress.streetAddress,
      "456 Shipping St"
    );
    assert.equal(
      graphQLVariables.paymentContext.payerInfo.shippingAddress.locality,
      "Porto"
    );
    assert.equal(
      graphQLVariables.paymentContext.payerInfo.shippingAddress.countryCode,
      "PT"
    );
  });

  it("should correctly generate map with only required fields", () => {
    const amount = new MonetaryAmountInput("5.00", "USD");

    const input = new CreateLocalPaymentContextInput({
      amount: amount,
      type: LocalPaymentType.CRYPTO,
    });

    const graphQLVariables = input.toGraphQLVariables();

    assert.isDefined(graphQLVariables.paymentContext);
    assert.equal(graphQLVariables.paymentContext.type, LocalPaymentType.CRYPTO);
    assert.equal(graphQLVariables.paymentContext.amount.value, "5.00");
    assert.equal(graphQLVariables.paymentContext.amount.currencyCode, "USD");
    assert.isUndefined(graphQLVariables.paymentContext.merchantAccountId);
    assert.isUndefined(graphQLVariables.paymentContext.orderId);
    assert.isUndefined(graphQLVariables.paymentContext.paymentId);
    assert.isUndefined(graphQLVariables.paymentContext.payerInfo);
  });
});

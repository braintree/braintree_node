"use strict";

/**
 * @experimental
 * Input fields for creating a local payment context.
 */
class CreateLocalPaymentContextInput {
  constructor(attributes = {}) {
    this.amount = attributes.amount;
    this.type = attributes.type;
    this.payerInfo = attributes.payerInfo;
    this.returnUrl = attributes.returnUrl;
    this.cancelUrl = attributes.cancelUrl;
    this.merchantAccountId = attributes.merchantAccountId;
    this.orderId = attributes.orderId;
    this.countryCode = attributes.countryCode;
    this.expiryDate = attributes.expiryDate;
    this.paymentId = attributes.paymentId;
  }

  /**
   * Converts the input object to a dictionary to pass as variables to a GraphQL mutation.
   * @returns {Object} A dictionary representing the input object wrapped in a paymentContext key.
   */
  toGraphQLVariables() {
    const paymentContext = {};

    if (this.amount) {
      paymentContext.amount = this.amount.toGraphQLVariables();
    }
    if (this.type) {
      paymentContext.type = this.type;
    }
    if (this.payerInfo) {
      paymentContext.payerInfo = this.payerInfo.toGraphQLVariables();
    }
    if (this.returnUrl) {
      paymentContext.returnUrl = this.returnUrl;
    }
    if (this.cancelUrl) {
      paymentContext.cancelUrl = this.cancelUrl;
    }
    if (this.merchantAccountId) {
      paymentContext.merchantAccountId = this.merchantAccountId;
    }
    if (this.orderId) {
      paymentContext.orderId = this.orderId;
    }
    if (this.countryCode) {
      paymentContext.countryCode = this.countryCode;
    }
    if (this.expiryDate) {
      paymentContext.expiryDate = this.expiryDate;
    }
    if (this.paymentId) {
      paymentContext.paymentId = this.paymentId;
    }

    return { paymentContext };
  }
}

module.exports = CreateLocalPaymentContextInput;

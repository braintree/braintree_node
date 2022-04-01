"use strict";

let EnrichedCustomerData =
  require("./enriched_customer_data").EnrichedCustomerData;
let PaymentMethodParser =
  require("./payment_method_parser").PaymentMethodParser;

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class PaymentMethodCustomerDataUpdatedMetadata extends AttributeSetter {
  constructor(attributes) {
    super(attributes);

    this.paymentMethod = PaymentMethodParser.parsePaymentMethod(
      attributes.paymentMethod
    );
    if (attributes.enrichedCustomerData) {
      this.enrichedCustomerData = new EnrichedCustomerData(
        attributes.enrichedCustomerData
      );
    }
  }
}

module.exports = {
  PaymentMethodCustomerDataUpdatedMetadata:
    PaymentMethodCustomerDataUpdatedMetadata,
};

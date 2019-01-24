'use strict';

let PaymentMethodParser = require('./payment_method_parser').PaymentMethodParser;

class RevokedPaymentMethodMetadata {
  constructor(attributes) {
    this.revokedPaymentMethod = PaymentMethodParser.parsePaymentMethod(attributes);
    this.customerId = this.revokedPaymentMethod.customerId;
    this.token = this.revokedPaymentMethod.token;
  }
}

module.exports = {RevokedPaymentMethodMetadata: RevokedPaymentMethodMetadata};

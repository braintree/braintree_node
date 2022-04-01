"use strict";

let generate = (number) => `stub-${number}`; // eslint-disable-line func-style

let VenmoSdk = {
  generateTestPaymentMethodCode: generate,
  VisaPaymentMethodCode: generate("4111111111111111"),
  InvalidPaymentMethodCode: "stub-invalid-payment-method-code",
  Session: "stub-session",
  InvalidSession: "stub-invalid-session",
};

module.exports = { VenmoSdk: VenmoSdk };

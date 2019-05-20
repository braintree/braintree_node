'use strict';

// NEXT_MAJOR_VERSION Remove this class as legacy Ideal has been removed/disabled in the Braintree Gateway
// DEPRECATED If you're looking to accept iDEAL as a payment method contact accounts@braintreepayments.com for a solution.

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class IdealPayment extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {IdealPayment: IdealPayment};

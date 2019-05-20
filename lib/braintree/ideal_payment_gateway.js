'use strict';

// NEXT_MAJOR_VERSION Remove this class as legacy Ideal has been removed/disabled in the Braintree Gateway
// DEPRECATED If you're looking to accept iDEAL as a payment method contact accounts@braintreepayments.com for a solution.

let Gateway = require('./gateway').Gateway;
let IdealPayment = require('./ideal_payment').IdealPayment;
let TransactionGateway = require('./transaction_gateway').TransactionGateway;
let exceptions = require('./exceptions');
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class IdealPaymentGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  find(idealPaymentId) {
    if (idealPaymentId.trim() === '') {
      return Promise.reject(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/ideal_payments/${idealPaymentId}`).then(function (response) {
      return new IdealPayment(response.idealPayment);
    });
  }

  sale(idealPaymentId, transactionRequest) {
    const request = Object.assign({}, transactionRequest);

    request.paymentMethodNonce = idealPaymentId;
    request.options = request.options || {};
    request.options.submitForSettlement = true;

    return new TransactionGateway(this.gateway).sale(request);
  }
}

module.exports = {IdealPaymentGateway: wrapPrototype(IdealPaymentGateway)};

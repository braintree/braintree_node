'use strict';

let Gateway = require('./gateway').Gateway;
let IdealPayment = require('./ideal_payment').IdealPayment;
let TransactionGateway = require('./transaction_gateway').TransactionGateway;
let exceptions = require('./exceptions');

class IdealPaymentGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  sale(nonce, transactionRequest, callback) {
    const request = Object.assign({}, transactionRequest);

    request.paymentMethodNonce = nonce;
    request.options = request.options || {};
    request.options.submitForSettlement = true;

    return new TransactionGateway(this.gateway).sale(request, callback);
  }
}

module.exports = {IdealPaymentGateway: IdealPaymentGateway};

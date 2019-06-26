'use strict';

let AddressGateway = require('./address_gateway').AddressGateway;
let Gateway = require('./gateway').Gateway;
let Transaction = require('./transaction').Transaction;
let TransactionSearch = require('./transaction_search').TransactionSearch;
let isFunction = require('underscore').isFunction;
let Util = require('./util').Util;
let exceptions = require('./exceptions');
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class TransactionGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  cancelRelease(transactionId) {
    let path = `${this.config.baseMerchantPath()}/transactions/${transactionId}/cancel_release`;
    let body = {};

    return this.gateway.http.put(path, body).then(this.responseHandler());
  }

  cloneTransaction(transactionId, attributes) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/transactions/${transactionId}/clone`, {
      transactionClone: attributes
    }).then(this.responseHandler());
  }

  create(attributes) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/transactions`, {transaction: attributes}).then(this.responseHandler());
  }

  credit(attributes) {
    attributes.type = 'credit';

    return this.create(attributes);
  }

  find(transactionId) {
    if (transactionId.trim() === '') {
      return Promise.reject(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/transactions/${transactionId}`).then((response) => {
      return new Transaction(response.transaction, this.gateway);
    });
  }

  holdInEscrow(transactionId) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/transactions/${transactionId}/hold_in_escrow`, {}).then(this.responseHandler());
  }

  refund(transactionId, options) {
    if (isFunction(options)) {
      options = {};
    } else if (typeof options !== 'object') {
      options = {amount: options};
    }

    return this.gateway.http.post(`${this.config.baseMerchantPath()}/transactions/${transactionId}/refund`, {transaction: options}).then(this.responseHandler());
  }

  responseHandler() {
    return this.createResponseHandler('transaction', Transaction);
  }

  sale(attributes) {
    let invalidKeysError;

    attributes.type = 'sale';
    invalidKeysError = Util.verifyKeys(this._createSignature(), attributes);

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError, null);
    }

    return this.create(attributes);
  }

  search(fn, callback) {
    let search = new TransactionSearch();

    fn(search);

    return this.createSearchResponse(`${this.config.baseMerchantPath()}/transactions/advanced_search_ids`, search, this.pagingFunctionGenerator(search), callback);
  }

  releaseFromEscrow(transactionId) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/transactions/${transactionId}/release_from_escrow`, {}).then(this.responseHandler());
  }

  submitForSettlement(transactionId, amount, options) {
    let invalidKeysError;

    options = options || {};

    invalidKeysError = Util.verifyKeys(this._submitForSettlementSignature(), options);

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError, null);
    }

    return this.gateway.http.put(`${this.config.baseMerchantPath()}/transactions/${transactionId}/submit_for_settlement`, {
      transaction: {amount, orderId: options.orderId, descriptor: options.descriptor}
    }).then(this.responseHandler());
  }

  updateDetails(transactionId, options) {
    let invalidKeysError = Util.verifyKeys(this._updateDetailsSignature(), options);

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError, null);
    }

    return this.gateway.http.put(`${this.config.baseMerchantPath()}/transactions/${transactionId}/update_details`, {
      transaction: options
    }).then(this.responseHandler());
  }

  submitForPartialSettlement(transactionId, amount, options) {
    let invalidKeysError;

    options = options || {};

    invalidKeysError = Util.verifyKeys(this._submitForSettlementSignature(), options);

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError, null);
    }

    return this.gateway.http.post(`${this.config.baseMerchantPath()}/transactions/${transactionId}/submit_for_partial_settlement`, {
      transaction: {amount, orderId: options.orderId, descriptor: options.descriptor}
    }).then(this.responseHandler());
  }

  void(transactionId) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/transactions/${transactionId}/void`, null).then(this.responseHandler());
  }

  pagingFunctionGenerator(search) {
    return super.pagingFunctionGenerator(search, 'transactions', Transaction, 'creditCardTransactions', response => response.creditCardTransactions.transaction);
  }

  _submitForSettlementSignature() {
    return {
      valid: ['orderId', 'descriptor[name]', 'descriptor[phone]', 'descriptor[url]']
    };
  }

  _updateDetailsSignature() {
    return {
      valid: ['amount', 'orderId', 'descriptor[name]', 'descriptor[phone]', 'descriptor[url]']
    };
  }

  _createSignature() {
    let validKeys = [
      'amount',
      'customerId',
      'merchantAccountId',
      'orderId',
      'channel',
      'paymentMethodToken',
      'purchaseOrderNumber',
      'recurring',
      'transactionSource',
      'shippingAddressId',
      'type',
      'taxAmount',
      'taxExempt',
      'venmoSdkPaymentMethodCode',
      'deviceSessionId',
      'serviceFeeAmount',
      'deviceData',
      'fraudMerchantId',
      'billingAddressId',
      'paymentMethodNonce',
      'paymentMethodToken',
      'threeDSecureToken',
      'sharedPaymentMethodToken',
      'sharedPaymentMethodNonce',
      'sharedBillingAddressId',
      'sharedCustomerId',
      'sharedShippingAddressId',
      'riskData',
      'riskData[customerBrowser]',
      'riskData[customerIp]',
      'riskData[customerBrowser]',
      'creditCard',
      'creditCard[token]',
      'creditCard[cardholderName]',
      'creditCard[cvv]',
      'creditCard[expirationDate]',
      'creditCard[expirationMonth]',
      'creditCard[expirationYear]',
      'creditCard[number]',
      'customer',
      'customer[id]',
      'customer[company]',
      'customer[email]',
      'customer[fax]',
      'customer[firstName]',
      'customer[lastName]',
      'customer[phone]',
      'customer[website]',
      'threeDSecurePassThru',
      'threeDSecurePassThru[eciFlag]',
      'threeDSecurePassThru[cavv]',
      'threeDSecurePassThru[xid]',
      'threeDSecurePassThru[threeDSecureVersion]',
      'threeDSecurePassThru[authenticationResponse]',
      'threeDSecurePassThru[directoryResponse]',
      'threeDSecurePassThru[cavvAlgorithm]',
      'threeDSecurePassThru[dsTransactionId]',
      'options',
      'options[credit_card][accountType]',
      'options[holdInEscrow]',
      'options[storeInVault]',
      'options[storeInVaultOnSuccess]',
      'options[submitForSettlement]',
      'options[addBillingAddressToPaymentMethod]',
      'options[storeShippingAddressInVault]',
      'options[venmoSdkSession]',
      'options[payeeId]',
      'options[payeeEmail]',
      'options[skipAdvancedFraudChecking]',
      'options[skipAvs]',
      'options[skipCvv]',
      'options[paypal]',
      'options[paypal][customField]',
      'options[paypal][payeeId]',
      'options[paypal][payeeEmail]',
      'options[paypal][description]',
      'options[threeDSecure]',
      'options[threeDSecure][required]',
      'options[amexRewards]',
      'options[amexRewards][requestId]',
      'options[amexRewards][points]',
      'options[amexRewards][currencyAmount]',
      'options[amexRewards][currencyIsoCode]',
      'options[venmo]',
      'options[venmo][profileId]',
      'descriptor',
      'descriptor[name]',
      'descriptor[phone]',
      'descriptor[url]',
      'paypalAccount',
      'paypalAccount[email]',
      'paypalAccount[token]',
      'paypalAccount[paypalData]',
      'paypalAccount[payeeId]',
      'paypalAccount[payeeEmail]',
      'paypalAccount[payerId]',
      'paypalAccount[paymentId]',
      'industry',
      'industry[industryType]',
      'industry[data]',
      'industry[data][folioNumber]',
      'industry[data][checkInDate]',
      'industry[data][checkOutDate]',
      'industry[data][travelPackage]',
      'industry[data][lodgingCheckInDate]',
      'industry[data][lodgingCheckOutDate]',
      'industry[data][departureDate]',
      'industry[data][lodgingName]',
      'industry[data][roomRate]',
      'industry[data][roomTax]',
      'industry[data][passengerFirstName]',
      'industry[data][passengerLastName]',
      'industry[data][passengerMiddleInitial]',
      'industry[data][passengerTitle]',
      'industry[data][issuedDate]',
      'industry[data][travelAgencyName]',
      'industry[data][travelAgencyCode]',
      'industry[data][ticketNumber]',
      'industry[data][issuingCarrierCode]',
      'industry[data][customerCode]',
      'industry[data][fareAmount]',
      'industry[data][feeAmount]',
      'industry[data][taxAmount]',
      'industry[data][restrictedTicket]',
      'industry[data][noShow]',
      'industry[data][advancedDeposit]',
      'industry[data][fireSafe]',
      'industry[data][propertyPhone]',
      'industry[data][legs][conjunctionTicket]',
      'industry[data][legs][exchangeTicket]',
      'industry[data][legs][couponNumber]',
      'industry[data][legs][serviceClass]',
      'industry[data][legs][carrierCode]',
      'industry[data][legs][fareBasisCode]',
      'industry[data][legs][flightNumber]',
      'industry[data][legs][departureDate]',
      'industry[data][legs][departureAirportCode]',
      'industry[data][legs][departureTime]',
      'industry[data][legs][arrivalAirportCode]',
      'industry[data][legs][arrivalTime]',
      'industry[data][legs][stopoverPermitted]',
      'industry[data][legs][fareAmount]',
      'industry[data][legs][feeAmount]',
      'industry[data][legs][taxAmount]',
      'industry[data][legs][endorsementOrRestrictions]',
      'industry[data][additionalCharges][kind]',
      'industry[data][additionalCharges][amount]',
      'discountAmount',
      'shippingAmount',
      'shipsFromPostalCode',
      'lineItems[quantity]',
      'lineItems[name]',
      'lineItems[description]',
      'lineItems[kind]',
      'lineItems[unitAmount]',
      'lineItems[unitTaxAmount]',
      'lineItems[totalAmount]',
      'lineItems[discountAmount]',
      'lineItems[unitOfMeasure]',
      'lineItems[productCode]',
      'lineItems[commodityCode]',
      'lineItems[url]',
      'lineItems[taxAmount]',
      'applePayCard',
      'applePayCard[number]',
      'applePayCard[cardholderName]',
      'applePayCard[cryptogram]',
      'applePayCard[expirationMonth]',
      'applePayCard[expirationYear]',
      'applePayCard[eciIndicator]',
      'androidPayCard',
      'androidPayCard[number]',
      'androidPayCard[cryptogram]',
      'androidPayCard[googleTransactionId]',
      'androidPayCard[expirationMonth]',
      'androidPayCard[expirationYear]',
      'androidPayCard[sourceCardType]',
      'androidPayCard[sourceCardLastFour]',
      'androidPayCard[eciIndicator]',
      'subscriptionId',
      'externalVault',
      'externalVault[status]',
      'externalVault[previousNetworkTransactionId]'
    ];

    validKeys = validKeys.concat(new AddressGateway(this).sharedSignature('shipping'), new AddressGateway(this).sharedSignature('billing'));

    return {
      valid: validKeys,
      ignore: ['customFields', 'options[paypal][supplementaryData]']
    };
  }
}

module.exports = {TransactionGateway: wrapPrototype(TransactionGateway, {
  ignoreMethods: ['search']
})};

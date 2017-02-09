'use strict';

let AddressGateway = require('./address_gateway').AddressGateway;
let Gateway = require('./gateway').Gateway;
let Transaction = require('./transaction').Transaction;
let TransactionSearch = require('./transaction_search').TransactionSearch;
let isFunction = require('underscore').isFunction;
let Util = require('./util').Util;
let exceptions = require('./exceptions');

class TransactionGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  cancelRelease(transactionId, callback) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/transactions/${transactionId}/cancel_release`,
      {},
      this.responseHandler(callback)
    );
  }

  cloneTransaction(transactionId, attributes, callback) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/transactions/${transactionId}/clone`, {transactionClone: attributes}, this.responseHandler(callback));
  }

  create(attributes, callback) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/transactions`, {transaction: attributes}, this.responseHandler(callback));
  }

  credit(attributes, callback) {
    attributes.type = 'credit';
    return this.create(attributes, callback);
  }

  find(transactionId, callback) {
    if (transactionId.trim() === '') {
      return callback(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/transactions/${transactionId}`, function (err, response) {
      if (err) {
        return callback(err, null);
      }

      return callback(null, new Transaction(response.transaction));
    });
  }

  holdInEscrow(transactionId, callback) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/transactions/${transactionId}/hold_in_escrow`,
      {},
      this.responseHandler(callback)
    );
  }

  refund(transactionId, options, callback) {
    if (!callback) {
      callback = options;
      options = {};
    } else if (typeof options !== 'object') {
      options = {amount: options};
    }

    return this.gateway.http.post(`${this.config.baseMerchantPath()}/transactions/${transactionId}/refund`, {transaction: options}, this.responseHandler(callback));
  }

  responseHandler(callback) {
    return this.createResponseHandler('transaction', Transaction, callback);
  }

  sale(attributes, callback) {
    let invalidKeysError;

    attributes.type = 'sale';
    invalidKeysError = Util.verifyKeys(this._createSignature(), attributes);

    if (invalidKeysError) {
      callback(invalidKeysError, null);
      return;
    }

    this.create(attributes, callback);
  }

  search(fn, callback) {
    let search = new TransactionSearch();

    fn(search);
    return this.createSearchResponse(`${this.config.baseMerchantPath()}/transactions/advanced_search_ids`, search, this.pagingFunctionGenerator(search), callback);
  }

  releaseFromEscrow(transactionId, callback) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/transactions/${transactionId}/release_from_escrow`,
      {},
      this.responseHandler(callback)
    );
  }

  submitForSettlement(transactionId, amount, options, callback) {
    let invalidKeysError;

    if (isFunction(amount)) {
      callback = amount;
      amount = undefined; // eslint-disable-line no-undefined
      options = {};
    } else if (isFunction(options)) {
      callback = options;
      options = {};
    }

    invalidKeysError = Util.verifyKeys(this._submitForSettlementSignature(), options);

    if (invalidKeysError) {
      callback(invalidKeysError, null);
      return;
    }

    this.gateway.http.put(`${this.config.baseMerchantPath()}/transactions/${transactionId}/submit_for_settlement`,
      {transaction: {amount, orderId: options.orderId, descriptor: options.descriptor}},
      this.responseHandler(callback)
    );
  }

  updateDetails(transactionId, options, callback) {
    let invalidKeysError = Util.verifyKeys(this._updateDetailsSignature(), options);

    if (invalidKeysError) {
      callback(invalidKeysError, null);
      return;
    }

    this.gateway.http.put(`${this.config.baseMerchantPath()}/transactions/${transactionId}/update_details`,
      {transaction: options},
      this.responseHandler(callback)
    );
  }

  submitForPartialSettlement(transactionId, amount, options, callback) {
    let invalidKeysError;

    if (isFunction(amount)) {
      callback = amount;
      amount = undefined; // eslint-disable-line no-undefined
      options = {};
    } else if (isFunction(options)) {
      callback = options;
      options = {};
    }
    invalidKeysError = Util.verifyKeys(this._submitForSettlementSignature(), options);

    if (invalidKeysError) {
      callback(invalidKeysError, null);
      return;
    }

    this.gateway.http.post(`${this.config.baseMerchantPath()}/transactions/${transactionId}/submit_for_partial_settlement`,
      {transaction: {amount, orderId: options.orderId, descriptor: options.descriptor}},
      this.responseHandler(callback)
    );
  }

  void(transactionId, callback) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/transactions/${transactionId}/void`, null, this.responseHandler(callback));
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
      'options',
      'options[holdInEscrow]',
      'options[storeInVault]',
      'options[storeInVaultOnSuccess]',
      'options[submitForSettlement]',
      'options[addBillingAddressToPaymentMethod]',
      'options[storeShippingAddressInVault]',
      'options[venmoSdkSession]',
      'options[payeeEmail]',
      'options[skipAdvancedFraudChecking]',
      'options[skipAvs]',
      'options[skipCvv]',
      'options[paypal]',
      'options[paypal][customField]',
      'options[paypal][payeeEmail]',
      'options[paypal][description]',
      'options[threeDSecure]',
      'options[threeDSecure][required]',
      'options[amexRewards]',
      'options[amexRewards][requestId]',
      'options[amexRewards][points]',
      'options[amexRewards][currencyAmount]',
      'options[amexRewards][currencyIsoCode]',
      'descriptor',
      'descriptor[name]',
      'descriptor[phone]',
      'descriptor[url]',
      'paypalAccount',
      'paypalAccount[email]',
      'paypalAccount[token]',
      'paypalAccount[paypalData]',
      'paypalAccount[payeeEmail]',
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
      'applePayCard',
      'applePayCard[number]',
      'applePayCard[cardholderName]',
      'applePayCard[cryptogram]',
      'applePayCard[expirationMonth]',
      'applePayCard[expirationYear]',
      'androidPayCard',
      'androidPayCard[number]',
      'androidPayCard[cryptogram]',
      'androidPayCard[googleTransactionId]',
      'androidPayCard[expirationMonth]',
      'androidPayCard[expirationYear]',
      'androidPayCard[sourceCardType]',
      'androidPayCard[sourceCardLastFour]',
      'androidPayCard[eciIndicator]',
      'subscriptionId'
    ];

    validKeys = validKeys.concat(new AddressGateway(this).sharedSignature('shipping'), new AddressGateway(this).sharedSignature('billing'));
    return {
      valid: validKeys,
      ignore: ['customFields', 'options[paypal][supplementaryData]']
    };
  }
}

module.exports = {TransactionGateway: TransactionGateway};

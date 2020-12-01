'use strict';

let Gateway = require('./gateway').Gateway;
let Util = require('./util').Util;
let Customer = require('./customer').Customer;
let CustomerSearch = require('./customer_search').CustomerSearch;
let exceptions = require('./exceptions');
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class CustomerGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  create(attributes) {
    let invalidKeysError = Util.verifyKeys(this._createSignature(), attributes);

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError);
    }

    this._checkForDeprecatedAttributes(attributes);

    return this.gateway.http.post(`${this.config.baseMerchantPath()}/customers`, {customer: attributes}).then(this.responseHandler());
  }

  delete(customerId) {
    return this.gateway.http.delete(`${this.config.baseMerchantPath()}/customers/${customerId}`);
  }

  find(customerId, associationFilterId) {
    let queryParams = '';

    if (customerId.trim() === '') {
      return Promise.reject(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    if (associationFilterId) {
      queryParams = `?association_filter_id=${associationFilterId}`;
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/customers/${customerId}${queryParams}`).then(function (response) {
      return new Customer(response.customer);
    });
  }

  update(customerId, attributes) {
    this._checkForDeprecatedAttributes(attributes);

    return this.gateway.http.put(`${this.config.baseMerchantPath()}/customers/${customerId}`, {customer: attributes}).then(this.responseHandler());
  }

  search(fn, callback) {
    let search = new CustomerSearch();

    fn(search);

    return this.createSearchResponse(`${this.config.baseMerchantPath()}/customers/advanced_search_ids`, search, this.pagingFunctionGenerator(search), callback);
  }

  responseHandler() {
    return this.createResponseHandler('customer', Customer);
  }

  pagingFunctionGenerator(search) {
    return super.pagingFunctionGenerator(search, 'customers/advanced_search', Customer, 'customers', response => response.customers.customer);
  }

  _createSignature() {
    return {
      valid: [
        'id',
        'company',
        'email',
        'fax',
        'firstName',
        'lastName',
        'phone',
        'website',
        'deviceData',
        // NEXT_MAJOR_VERSION remove deviceSessionId
        'deviceSessionId',
        // NEXT_MAJOR_VERSION remove fraudMerchantId
        'fraudMerchantId',
        'paymentMethodNonce',
        'riskData',
        'riskData[customerBrowser]',
        'riskData[customerIp]',
        'creditCard',
        'creditCard[token]',
        'creditCard[cardholderName]',
        'creditCard[cvv]',
        'creditCard[expirationDate]',
        'creditCard[expirationMonth]',
        'creditCard[expirationYear]',
        'creditCard[number]',
        'creditCard[paymentMethodNonce]',
        'creditCard[venmoSdkPaymentMethodCode]',
        'creditCard[options]',
        'creditCard[threeDSecurePassThru]',
        'creditCard[threeDSecurePassThru][eciFlag]',
        'creditCard[threeDSecurePassThru][cavv]',
        'creditCard[threeDSecurePassThru][xid]',
        'creditCard[threeDSecurePassThru][threeDSecureVersion]',
        'creditCard[threeDSecurePassThru][authenticationResponse]',
        'creditCard[threeDSecurePassThru][directoryResponse]',
        'creditCard[threeDSecurePassThru][cavvAlgorithm]',
        'creditCard[threeDSecurePassThru][dsTransactionId]',
        'creditCard[options][failOnDuplicatePaymentMethod]',
        'creditCard[options][makeDefault]',
        'creditCard[options][verificationAmount]',
        'creditCard[options][verificationMerchantAccountId]',
        'creditCard[options][verifyCard]',
        'creditCard[options][verificationAccountType]',
        'creditCard[options][venmoSdkSession]',
        'creditCard[billingAddress]',
        'creditCard[billingAddress][company]',
        'creditCard[billingAddress][countryCodeAlpha2]',
        'creditCard[billingAddress][countryCodeAlpha3]',
        'creditCard[billingAddress][countryCodeNumeric]',
        'creditCard[billingAddress][countryName]',
        'creditCard[billingAddress][extendedAddress]',
        'creditCard[billingAddress][firstName]',
        'creditCard[billingAddress][lastName]',
        'creditCard[billingAddress][locality]',
        'creditCard[billingAddress][postalCode]',
        'creditCard[billingAddress][region]',
        'creditCard[billingAddress][streetAddress]',
        'creditCard[billingAddress][options]',
        'creditCard[billingAddress][options][updateExisting]',
        'options',
        'options[paypal]',
        'options[paypal][payeeEmail]',
        'options[paypal][orderId]',
        'options[paypal][amount]',
        'options[paypal][description]',
        'options[paypal][shipping]',
        'options[paypal][shipping][firstName]',
        'options[paypal][shipping][lastName]',
        'options[paypal][shipping][company]',
        'options[paypal][shipping][countryName]',
        'options[paypal][shipping][countryCodeAlpha2]',
        'options[paypal][shipping][countryCodeAlpha3]',
        'options[paypal][shipping][countryCodeNumeric]',
        'options[paypal][shipping][extendedAddress]',
        'options[paypal][shipping][locality]',
        'options[paypal][shipping][postalCode]',
        'options[paypal][shipping][region]',
        'options[paypal][shipping][streetAddress]'
      ],
      ignore: ['customFields', 'options[paypal][customField]']
    };
  }

  _checkForDeprecatedAttributes(attributes) {
    if (attributes.deviceSessionId != null) {
      console.warn('[DEPRECATED] `deviceSessionId` is a deprecated param for Customer objects. Use `deviceData` instead'); // eslint-disable-line no-console
    }

    if (attributes.fraudMerchantId != null) {
      console.warn('[DEPRECATED] `fraudMerchantId` is a deprecated param for Customer objects. Use `deviceData` instead'); // eslint-disable-line no-console
    }
  }
}

module.exports = {CustomerGateway: wrapPrototype(CustomerGateway, {
  ignoreMethods: ['search']
})};

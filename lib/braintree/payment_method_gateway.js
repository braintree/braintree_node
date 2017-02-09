'use strict';

let Gateway = require('./gateway').Gateway;
let ApplePayCard = require('./apple_pay_card').ApplePayCard;
let AndroidPayCard = require('./android_pay_card').AndroidPayCard;
let CreditCard = require('./credit_card').CreditCard;
let PayPalAccount = require('./paypal_account').PayPalAccount;
let CoinbaseAccount = require('./coinbase_account').CoinbaseAccount;
let UnknownPaymentMethod = require('./unknown_payment_method').UnknownPaymentMethod;
let PaymentMethodNonce = require('./payment_method_nonce').PaymentMethodNonce;
let UsBankAccount = require('./us_bank_account').UsBankAccount;
let VenmoAccount = require('./venmo_account').VenmoAccount;
let Util = require('./util').Util;
let exceptions = require('./exceptions');
let querystring = require('../../vendor/querystring.node.js.511d6a2/querystring');

class PaymentMethodGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  responseHandler(callback) {
    let responseMapping = {
      paypalAccount: PayPalAccount,
      coinbaseAccount: CoinbaseAccount,
      creditCard: CreditCard,
      applePayCard: ApplePayCard,
      androidPayCard: AndroidPayCard,
      paymentMethodNonce: PaymentMethodNonce
    };

    return this.createResponseHandler(responseMapping, null, function (err, response) {
      if (!err) {
        let parsedResponse = PaymentMethodGateway.parsePaymentMethod(response);

        if (parsedResponse instanceof PaymentMethodNonce) {
          response.paymentMethodNonce = parsedResponse;
        } else {
          response.paymentMethod = parsedResponse;
        }
      }
      return callback(err, response);
    });
  }

  create(attributes, callback) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/payment_methods`, {paymentMethod: attributes}, this.responseHandler(callback));
  }

  find(token, callback) {
    if (token.trim() === '') {
      return callback(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/payment_methods/any/${token}`, function (err, response) {
      if (err) {
        return callback(err, null);
      }

      return callback(null, PaymentMethodGateway.parsePaymentMethod(response));
    });
  }

  update(token, attributes, callback) {
    if (token.trim() === '') {
      return callback(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.put(`${this.config.baseMerchantPath()}/payment_methods/any/${token}`, {paymentMethod: attributes}, this.responseHandler(callback));
  }

  grant(token, attributes, callback) {
    if (token.trim() === '') {
      return callback(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    let grantOptions = {
      sharedPaymentMethodToken: token
    };

    if (typeof attributes === 'boolean') {
      attributes = {allow_vaulting: attributes}; // eslint-disable-line camelcase
    }

    grantOptions = Util.merge(grantOptions, attributes);
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/payment_methods/grant`, {
      payment_method: grantOptions // eslint-disable-line camelcase
    }, this.responseHandler(callback));
  }

  revoke(token, callback) {
    if (token.trim() === '') {
      return callback(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.post(`${this.config.baseMerchantPath()}/payment_methods/revoke`, {
      payment_method: { // eslint-disable-line camelcase
        sharedPaymentMethodToken: token
      }
    }, this.responseHandler(callback));
  }

  static parsePaymentMethod(response) {
    if (response.creditCard) {
      return new CreditCard(response.creditCard);
    } else if (response.paypalAccount) {
      return new PayPalAccount(response.paypalAccount);
    } else if (response.applePayCard) {
      return new ApplePayCard(response.applePayCard);
    } else if (response.androidPayCard) {
      return new AndroidPayCard(response.androidPayCard);
    } else if (response.coinbaseAccount) {
      return new CoinbaseAccount(response.coinbaseAccount);
    } else if (response.paymentMethodNonce) {
      return new PaymentMethodNonce(response.paymentMethodNonce);
    } else if (response.usBankAccount) {
      return new UsBankAccount(response.usBankAccount);
    } else if (response.venmoAccount) {
      return new VenmoAccount(response.venmoAccount);
    }

    return new UnknownPaymentMethod(response);
  }

  delete(token, options, callback) {
    let queryParam, invalidKeysError;

    if (!callback) {
      callback = options;
      options = null;
    }
    invalidKeysError = Util.verifyKeys(this._deleteSignature(), options);

    if (invalidKeysError) {
      callback(invalidKeysError);
      return;
    }
    queryParam = options != null ? '?' + querystring.stringify(Util.convertObjectKeysToUnderscores(options)) : '';
    this.gateway.http.delete(this.config.baseMerchantPath() + '/payment_methods/any/' + token + queryParam, callback);
  }

  _deleteSignature() {
    return {
      valid: ['revokeAllGrants']
    };
  }
}

module.exports = {PaymentMethodGateway: PaymentMethodGateway};

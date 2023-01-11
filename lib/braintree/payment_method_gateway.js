"use strict";
/* eslint-disable no-console, new-cap */

let Gateway = require("./gateway").Gateway;
let ApplePayCard = require("./apple_pay_card").ApplePayCard;
let AndroidPayCard = require("./android_pay_card").AndroidPayCard;
let CreditCard = require("./credit_card").CreditCard;
let PaymentMethodParser =
  require("./payment_method_parser").PaymentMethodParser;
let PayPalAccount = require("./paypal_account").PayPalAccount;
let PaymentMethodNonce = require("./payment_method_nonce").PaymentMethodNonce;
let SepaDirectDebitAccount =
  require("./sepa_direct_debit_account").SepaDirectDebitAccount;
let Util = require("./util").Util;
let exceptions = require("./exceptions");
let querystring = require("../../vendor/querystring.node.js.511d6a2/querystring");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class PaymentMethodGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  responseHandler() {
    let responseMapping = {
      paypalAccount: PayPalAccount,
      sepaDirectDebitAccount: SepaDirectDebitAccount,
      creditCard: CreditCard,
      applePayCard: ApplePayCard,
      // NEXT_MAJOR_VERSION rename Android Pay to Google Pay
      androidPayCard: AndroidPayCard,
      paymentMethodNonce: PaymentMethodNonce,
    };
    let handler = this.createResponseHandler(responseMapping, null);

    return function (payload) {
      return handler(payload).then(function (response) {
        let parsedResponse = PaymentMethodParser.parsePaymentMethod(response);

        if (parsedResponse instanceof PaymentMethodNonce) {
          response.paymentMethodNonce = parsedResponse;
        } else {
          response.paymentMethod = parsedResponse;
        }

        return response;
      });
    };
  }

  create(attributes) {
    this._checkForDeprecatedAttributes(attributes);

    return this.gateway.http
      .post(`${this.config.baseMerchantPath()}/payment_methods`, {
        paymentMethod: attributes,
      })
      .then(this.responseHandler());
  }

  find(token) {
    if (token.trim() === "") {
      return Promise.reject(exceptions.NotFoundError("Not Found"), null);
    }

    return this.gateway.http
      .get(`${this.config.baseMerchantPath()}/payment_methods/any/${token}`)
      .then((response) => {
        return PaymentMethodParser.parsePaymentMethod(response);
      });
  }

  update(token, attributes) {
    if (token.trim() === "") {
      return Promise.reject(exceptions.NotFoundError("Not Found"), null);
    }

    this._checkForDeprecatedAttributes(attributes);

    return this.gateway.http
      .put(`${this.config.baseMerchantPath()}/payment_methods/any/${token}`, {
        paymentMethod: attributes,
      })
      .then(this.responseHandler());
  }

  grant(token, attributes) {
    if (token.trim() === "") {
      return Promise.reject(exceptions.NotFoundError("Not Found"), null);
    }

    let grantOptions = {
      sharedPaymentMethodToken: token,
    };

    if (typeof attributes === "boolean") {
      // eslint-disable-next-line camelcase
      attributes = { allow_vaulting: attributes };
    }

    grantOptions = Util.merge(grantOptions, attributes);

    return this.gateway.http
      .post(`${this.config.baseMerchantPath()}/payment_methods/grant`, {
        // eslint-disable-next-line camelcase
        payment_method: grantOptions,
      })
      .then(this.responseHandler());
  }

  revoke(token) {
    if (token.trim() === "") {
      return Promise.reject(exceptions.NotFoundError("Not Found"), null);
    }

    return this.gateway.http
      .post(`${this.config.baseMerchantPath()}/payment_methods/revoke`, {
        // eslint-disable-next-line camelcase
        payment_method: {
          sharedPaymentMethodToken: token,
        },
      })
      .then(this.responseHandler());
  }

  delete(token, options) {
    let queryParam, invalidKeysError;

    if (typeof options === "function") {
      options = null;
    }
    invalidKeysError = Util.verifyKeys(this._deleteSignature(), options);

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError);
    }
    queryParam =
      options != null
        ? "?" +
          querystring.stringify(Util.convertObjectKeysToUnderscores(options))
        : "";

    return this.gateway.http.delete(
      this.config.baseMerchantPath() +
        "/payment_methods/any/" +
        token +
        queryParam
    );
  }

  _deleteSignature() {
    return {
      valid: ["revokeAllGrants"],
    };
  }

  _checkForDeprecatedAttributes(attributes) {
    if (attributes.deviceSessionId != null) {
      console.warn(
        "[DEPRECATED] `deviceSessionId` is a deprecated param for PaymentMethod objects. Use `deviceData` instead"
      );
    }

    if (attributes.fraudMerchantId != null) {
      console.warn(
        "[DEPRECATED] `fraudMerchantId` is a deprecated param for PaymentMethod objects. Use `deviceData` instead"
      );
    }
  }
}

module.exports = { PaymentMethodGateway: wrapPrototype(PaymentMethodGateway) };

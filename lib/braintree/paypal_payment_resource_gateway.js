"use strict";

let Gateway = require("./gateway").Gateway;
let Util = require("./util").Util;
let PaymentMethodNonce = require("./payment_method_nonce").PaymentMethodNonce;
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class PayPalPaymentResourceGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  update(attributes) {
    let invalidKeysError = Util.verifyKeys(this._updateSignature(), attributes);

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError);
    }

    return this.gateway.http
      .put(`${this.config.baseMerchantPath()}/paypal/payment_resource`, {
        paypalPaymentResource: attributes,
      })
      .then(this.responseHandler());
  }

  responseHandler() {
    return this.createResponseHandler(
      "payment_method_nonce",
      PaymentMethodNonce
    );
  }

  _updateSignature() {
    return {
      valid: [
        "amount",
        "amountBreakdown[discount]",
        "amountBreakdown[handling]",
        "amountBreakdown[insurance]",
        "amountBreakdown[itemTotal]",
        "amountBreakdown[shipping]",
        "amountBreakdown[shippingDiscount]",
        "amountBreakdown[taxTotal]",
        "currencyIsoCode",
        "customField",
        "description",
        "lineItems[commodityCode]",
        "lineItems[description]",
        "lineItems[discountAmount]",
        "lineItems[imageUrl]",
        "lineItems[itemType]",
        "lineItems[kind]",
        "lineItems[name]",
        "lineItems[productCode]",
        "lineItems[quantity]",
        "lineItems[taxAmount]",
        "lineItems[totalAmount]",
        "lineItems[unitAmount]",
        "lineItems[unitOfMeasure]",
        "lineItems[unitTaxAmount]",
        "lineItems[upcCode]",
        "lineItems[upcType]",
        "lineItems[url]",
        "orderId",
        "payeeEmail",
        "paymentMethodNonce",
        "shipping[company]",
        "shipping[countryCodeAlpha2]",
        "shipping[countryCodeAlpha3]",
        "shipping[countryCodeNumeric]",
        "shipping[countryName]",
        "shipping[extendedAddress]",
        "shipping[firstName]",
        "shipping[internationalPhone][countryCode]",
        "shipping[internationalPhone][nationalNumber]",
        "shipping[lastName]",
        "shipping[locality]",
        "shipping[phoneNumber]",
        "shipping[postalCode]",
        "shipping[region]",
        "shipping[streetAddress]",
        "shippingOptions[amount]",
        "shippingOptions[id]",
        "shippingOptions[label]",
        "shippingOptions[selected]",
        "shippingOptions[type]",
      ],
    };
  }
}

module.exports = {
  PayPalPaymentResourceGateway: wrapPrototype(PayPalPaymentResourceGateway),
};

"use strict";
/* eslint-disable no-console */

let AddressGateway = require("./address_gateway").AddressGateway;
let Gateway = require("./gateway").Gateway;
let Transaction = require("./transaction").Transaction;
let TransactionSearch = require("./transaction_search").TransactionSearch;
let Util = require("./util").Util;
let exceptions = require("./exceptions");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class TransactionGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  adjustAuthorization(transactionId, amount) {
    return this.gateway.http
      .put(
        `${this.config.baseMerchantPath()}/transactions/${transactionId}/adjust_authorization`,
        {
          transaction: { amount: amount },
        }
      )
      .then(this.responseHandler());
  }

  cancelRelease(transactionId) {
    let path = `${this.config.baseMerchantPath()}/transactions/${transactionId}/cancel_release`;
    let body = {};

    return this.gateway.http.put(path, body).then(this.responseHandler());
  }

  cloneTransaction(transactionId, attributes) {
    return this.gateway.http
      .post(
        `${this.config.baseMerchantPath()}/transactions/${transactionId}/clone`,
        {
          transactionClone: attributes,
        }
      )
      .then(this.responseHandler());
  }

  create(attributes) {
    return this.gateway.http
      .post(`${this.config.baseMerchantPath()}/transactions`, {
        transaction: attributes,
      })
      .then(this.responseHandler());
  }

  credit(attributes) {
    attributes.type = "credit";

    return this.create(attributes);
  }

  find(transactionId) {
    if (transactionId.trim() === "") {
      return Promise.reject(exceptions.NotFoundError("Not Found"), null); // eslint-disable-line new-cap
    }

    return this.gateway.http
      .get(`${this.config.baseMerchantPath()}/transactions/${transactionId}`)
      .then((response) => {
        return new Transaction(response.transaction, this.gateway);
      });
  }

  holdInEscrow(transactionId) {
    return this.gateway.http
      .put(
        `${this.config.baseMerchantPath()}/transactions/${transactionId}/hold_in_escrow`,
        {}
      )
      .then(this.responseHandler());
  }

  refund(transactionId, options) {
    if (typeof options === "function") {
      options = {};
    } else if (typeof options !== "object") {
      options = { amount: options };
    }

    return this.gateway.http
      .post(
        `${this.config.baseMerchantPath()}/transactions/${transactionId}/refund`,
        { transaction: options }
      )
      .then(this.responseHandler());
  }

  responseHandler() {
    return this.createResponseHandler("transaction", Transaction);
  }

  sale(attributes) {
    let invalidKeysError;

    this._checkForDeprecatedAttributes(attributes);

    attributes.type = "sale";
    invalidKeysError = Util.verifyKeys(this._createSignature(), attributes);

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError, null);
    }

    return this.create(attributes);
  }

  search(fn, callback) {
    let search = new TransactionSearch();

    fn(search);

    return this.createSearchResponse(
      `${this.config.baseMerchantPath()}/transactions/advanced_search_ids`,
      search,
      this.pagingFunctionGenerator(search),
      callback
    );
  }

  releaseFromEscrow(transactionId) {
    return this.gateway.http
      .put(
        `${this.config.baseMerchantPath()}/transactions/${transactionId}/release_from_escrow`,
        {}
      )
      .then(this.responseHandler());
  }

  submitForSettlement(transactionId, amount, options) {
    let invalidKeysError;

    options = options || {};

    invalidKeysError = Util.verifyKeys(
      this._submitForSettlementSignature(),
      options
    );

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError, null);
    }

    return this.gateway.http
      .put(
        `${this.config.baseMerchantPath()}/transactions/${transactionId}/submit_for_settlement`,
        {
          transaction: Object.assign(
            {
              amount,
            },
            options
          ),
        }
      )
      .then(this.responseHandler());
  }

  updateDetails(transactionId, options) {
    let invalidKeysError = Util.verifyKeys(
      this._updateDetailsSignature(),
      options
    );

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError, null);
    }

    return this.gateway.http
      .put(
        `${this.config.baseMerchantPath()}/transactions/${transactionId}/update_details`,
        {
          transaction: options,
        }
      )
      .then(this.responseHandler());
  }

  packageTracking(transactionId, attributes) {
    let invalidKeysError = Util.verifyKeys(
      this._packageTrackingSignature(),
      attributes
    );

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError, null);
    }

    return this.gateway.http
      .post(
        `${this.config.baseMerchantPath()}/transactions/${transactionId}/shipments`,
        {
          shipment: attributes,
        }
      )
      .then(this.responseHandler());
  }

  submitForPartialSettlement(transactionId, amount, options) {
    let invalidKeysError;

    options = options || {};

    invalidKeysError = Util.verifyKeys(
      this._submitForPartialSettlementSignature(),
      options
    );

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError, null);
    }

    return this.gateway.http
      .post(
        `${this.config.baseMerchantPath()}/transactions/${transactionId}/submit_for_partial_settlement`,
        {
          transaction: Object.assign(
            {
              amount,
            },
            options
          ),
        }
      )
      .then(this.responseHandler());
  }

  void(transactionId) {
    return this.gateway.http
      .put(
        `${this.config.baseMerchantPath()}/transactions/${transactionId}/void`,
        null
      )
      .then(this.responseHandler());
  }

  pagingFunctionGenerator(search) {
    return super.pagingFunctionGenerator(
      search,
      "transactions/advanced_search",
      Transaction,
      "creditCardTransactions",
      (response) => response.creditCardTransactions.transaction
    );
  }

  _submitForSettlementSignature() {
    return {
      valid: [
        "descriptor[name]",
        "descriptor[phone]",
        "descriptor[url]",
        "discountAmount",
        "industry",
        "industry[data]",
        "industry[data][additionalCharges][amount]",
        "industry[data][additionalCharges][kind]",
        "industry[data][advancedDeposit]",
        "industry[data][arrivalDate]",
        "industry[data][checkInDate]",
        "industry[data][checkOutDate]",
        "industry[data][countryCode]",
        "industry[data][customerCode]",
        "industry[data][dateOfBirth]",
        "industry[data][departureDate]",
        "industry[data][fareAmount]",
        "industry[data][feeAmount]",
        "industry[data][fireSafe]",
        "industry[data][folioNumber]",
        "industry[data][issuedDate]",
        "industry[data][issuingCarrierCode]",
        "industry[data][legs][arrivalAirportCode]",
        "industry[data][legs][arrivalTime]",
        "industry[data][legs][carrierCode]",
        "industry[data][legs][conjunctionTicket]",
        "industry[data][legs][couponNumber]",
        "industry[data][legs][departureAirportCode]",
        "industry[data][legs][departureDate]",
        "industry[data][legs][departureTime]",
        "industry[data][legs][endorsementOrRestrictions]",
        "industry[data][legs][exchangeTicket]",
        "industry[data][legs][fareAmount]",
        "industry[data][legs][fareBasisCode]",
        "industry[data][legs][feeAmount]",
        "industry[data][legs][flightNumber]",
        "industry[data][legs][serviceClass]",
        "industry[data][legs][stopoverPermitted]",
        "industry[data][legs][taxAmount]",
        "industry[data][lodgingCheckInDate]",
        "industry[data][lodgingCheckOutDate]",
        "industry[data][lodgingName]",
        "industry[data][noShow]",
        "industry[data][passengerFirstName]",
        "industry[data][passengerLastName]",
        "industry[data][passengerMiddleInitial]",
        "industry[data][passengerTitle]",
        "industry[data][propertyPhone]",
        "industry[data][restrictedTicket]",
        "industry[data][roomRate]",
        "industry[data][roomTax]",
        "industry[data][taxAmount]",
        "industry[data][ticketIssuerAddress]",
        "industry[data][ticketNumber]",
        "industry[data][travelAgencyName]",
        "industry[data][travelAgencyCode]",
        "industry[data][travelPackage]",
        "industry[industryType]",
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
        "purchaseOrderNumber",
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
        "shippingAddressId",
        "shippingAmount",
        "shippingTaxAmount",
        "shipsFromPostalCode",
        "taxAmount",
        "taxExempt",
      ],
    };
  }

  _submitForPartialSettlementSignature() {
    let validKeys = this._submitForSettlementSignature();

    validKeys.valid.push("finalCapture");

    return validKeys;
  }

  _updateDetailsSignature() {
    return {
      valid: [
        "amount",
        "orderId",
        "descriptor[name]",
        "descriptor[phone]",
        "descriptor[url]",
      ],
    };
  }

  _packageTrackingSignature() {
    return {
      valid: [
        "carrier",
        "lineItems[commodityCode]",
        "lineItems[description]",
        "lineItems[discountAmount]",
        "lineItems[imageUrl]",
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
        "notifyPayer",
        "trackingNumber",
      ],
    };
  }

  _createSignature() {
    let validKeys = [
      "amount",
      "customerId",
      "exchangeRateQuoteId",
      "merchantAccountId",
      "orderId",
      "channel",
      "paymentMethodToken",
      "purchaseOrderNumber",
      "recurring",
      "transactionSource",
      "shippingAddressId",
      "type",
      "taxAmount",
      "taxExempt",
      // NEXT_MAJOR_VERSION remove "venmoSdkPaymentMethodCode"
      "venmoSdkPaymentMethodCode",
      // NEXT_MAJOR_VERSION remove deviceSessionId
      "deviceSessionId",
      "serviceFeeAmount",
      "deviceData",
      // NEXT_MAJOR_VERSION remove fraudMerchantId
      "fraudMerchantId",
      "billingAddressId",
      "paymentMethodNonce",
      "paymentMethodToken",
      "acquirerReferenceNumber",
      // NEXT_MAJOR_VERSION remove threeDSecureToken
      "threeDSecureToken",
      "threeDSecureAuthenticationId",
      "sharedPaymentMethodToken",
      "sharedPaymentMethodNonce",
      "sharedBillingAddressId",
      "sharedCustomerId",
      "sharedShippingAddressId",
      "riskData",
      "riskData[customerBrowser]",
      "riskData[customerDeviceId]",
      "riskData[customerIp]",
      "riskData[customerLocationZip]",
      "riskData[customerTenure]",
      "creditCard",
      "creditCard[token]",
      "creditCard[cardholderName]",
      "creditCard[cvv]",
      "creditCard[expirationDate]",
      "creditCard[expirationMonth]",
      "creditCard[expirationYear]",
      "creditCard[networkTokenizationAttributes][cryptogram]",
      "creditCard[networkTokenizationAttributes][ecommerceIndicator]",
      "creditCard[networkTokenizationAttributes][tokenRequestorId]",
      "creditCard[number]",
      "creditCard[paymentReaderCardDetails][encryptedCardData]",
      "creditCard[paymentReaderCardDetails][keySerialNumber]",
      "customer",
      "customer[id]",
      "customer[company]",
      "customer[email]",
      "customer[fax]",
      "customer[firstName]",
      "customer[lastName]",
      "customer[phone]",
      "customer[website]",
      "threeDSecurePassThru",
      "threeDSecurePassThru[eciFlag]",
      "threeDSecurePassThru[cavv]",
      "threeDSecurePassThru[xid]",
      "threeDSecurePassThru[threeDSecureVersion]",
      "threeDSecurePassThru[authenticationResponse]",
      "threeDSecurePassThru[directoryResponse]",
      "threeDSecurePassThru[cavvAlgorithm]",
      "threeDSecurePassThru[dsTransactionId]",
      "options",
      "options[credit_card][accountType]",
      "options[credit_card][processDebitAsCredit]",
      "options[holdInEscrow]",
      "options[storeInVault]",
      "options[storeInVaultOnSuccess]",
      "options[submitForSettlement]",
      "options[addBillingAddressToPaymentMethod]",
      "options[storeShippingAddressInVault]",
      // NEXT_MAJOR_VERSION remove "options[venmoSdkSession]"
      "options[venmoSdkSession]",
      "options[payeeId]",
      "options[payeeEmail]",
      "options[skipAdvancedFraudChecking]",
      "options[skipAvs]",
      "options[skipCvv]",
      "options[paypal]",
      "options[paypal][customField]",
      "options[paypal][payeeId]",
      "options[paypal][payeeEmail]",
      "options[paypal][description]",
      "options[threeDSecure]",
      "options[threeDSecure][required]",
      "options[amexRewards]",
      "options[amexRewards][requestId]",
      "options[amexRewards][points]",
      "options[amexRewards][currencyAmount]",
      "options[amexRewards][currencyIsoCode]",
      "options[processingOverrides]",
      "options[processingOverrides][customerEmail]",
      "options[processingOverrides][customerFirstName]",
      "options[processingOverrides][customerLastName]",
      "options[processingOverrides][customerTaxIdentifier]",
      "options[venmo]",
      "options[venmo][profileId]",
      "descriptor",
      "descriptor[name]",
      "descriptor[phone]",
      "descriptor[url]",
      "paypalAccount",
      "paypalAccount[email]",
      "paypalAccount[token]",
      "paypalAccount[paypalData]",
      "paypalAccount[payeeId]",
      "paypalAccount[payeeEmail]",
      "paypalAccount[payerId]",
      "paypalAccount[paymentId]",
      "productSku",
      "industry",
      "industry[data]",
      "industry[data][additionalCharges][kind]",
      "industry[data][additionalCharges][amount]",
      "industry[data][advancedDeposit]",
      "industry[data][arrivalDate]",
      "industry[data][checkInDate]",
      "industry[data][checkOutDate]",
      "industry[data][countryCode]",
      "industry[data][customerCode]",
      "industry[data][dateOfBirth]",
      "industry[data][departureDate]",
      "industry[data][fareAmount]",
      "industry[data][feeAmount]",
      "industry[data][fireSafe]",
      "industry[data][folioNumber]",
      "industry[data][issuedDate]",
      "industry[data][issuingCarrierCode]",
      "industry[data][legs][arrivalAirportCode]",
      "industry[data][legs][arrivalTime]",
      "industry[data][legs][carrierCode]",
      "industry[data][legs][conjunctionTicket]",
      "industry[data][legs][couponNumber]",
      "industry[data][legs][departureAirportCode]",
      "industry[data][legs][departureDate]",
      "industry[data][legs][departureTime]",
      "industry[data][legs][endorsementOrRestrictions]",
      "industry[data][legs][exchangeTicket]",
      "industry[data][legs][fareAmount]",
      "industry[data][legs][fareBasisCode]",
      "industry[data][legs][feeAmount]",
      "industry[data][legs][flightNumber]",
      "industry[data][legs][serviceClass]",
      "industry[data][legs][stopoverPermitted]",
      "industry[data][legs][taxAmount]",
      "industry[data][lodgingCheckInDate]",
      "industry[data][lodgingCheckOutDate]",
      "industry[data][lodgingName]",
      "industry[data][noShow]",
      "industry[data][passengerFirstName]",
      "industry[data][passengerLastName]",
      "industry[data][passengerMiddleInitial]",
      "industry[data][passengerTitle]",
      "industry[data][propertyPhone]",
      "industry[data][restrictedTicket]",
      "industry[data][roomRate]",
      "industry[data][roomTax]",
      "industry[data][taxAmount]",
      "industry[data][ticketIssuerAddress]",
      "industry[data][ticketNumber]",
      "industry[data][travelAgencyCode]",
      "industry[data][travelAgencyName]",
      "industry[data][travelPackage]",
      "industry[industryType]",
      "installments[count]",
      "discountAmount",
      "shippingAmount",
      "shippingTaxAmount",
      "shipsFromPostalCode",
      "lineItems[commodityCode]",
      "lineItems[description]",
      "lineItems[discountAmount]",
      "lineItems[imageUrl]",
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
      "applePayCard",
      "applePayCard[number]",
      "applePayCard[cardholderName]",
      "applePayCard[cryptogram]",
      "applePayCard[expirationMonth]",
      "applePayCard[expirationYear]",
      "applePayCard[eciIndicator]",
      // NEXT_MAJOR_VERSION rename Android Pay to Google Pay
      "androidPayCard",
      "androidPayCard[number]",
      "androidPayCard[cryptogram]",
      "androidPayCard[googleTransactionId]",
      "androidPayCard[expirationMonth]",
      "androidPayCard[expirationYear]",
      "androidPayCard[sourceCardType]",
      "androidPayCard[sourceCardLastFour]",
      "androidPayCard[eciIndicator]",
      "subscriptionId",
      "externalVault",
      "externalVault[status]",
      "externalVault[previousNetworkTransactionId]",
      "scaExemption",
      "foreignRetailer",
    ];

    let validShippingKeys = new AddressGateway(this)
      .sharedSignature("shipping")
      .concat("shipping[shippingMethod]");
    let validBillingKeys = new AddressGateway(this).sharedSignature("billing");

    validKeys = validKeys.concat(validShippingKeys, validBillingKeys);

    return {
      valid: validKeys,
      ignore: ["customFields", "options[paypal][supplementaryData]"],
    };
  }

  _checkForDeprecatedAttributes(attributes) {
    if (attributes.recurring != null) {
      console.warn(
        "[DEPRECATED] `recurring` is a deprecated param for transaction.sale calls. Use `transactionSource` instead"
      );
    }

    if (attributes.deviceSessionId != null) {
      console.warn(
        "[DEPRECATED] `deviceSessionId` is a deprecated param for transaction.sale calls. Use `deviceData` instead"
      );
    }

    if (attributes.fraudMerchantId != null) {
      console.warn(
        "[DEPRECATED] `fraudMerchantId` is a deprecated param for transaction.sale calls. Use `deviceData` instead"
      );
    }

    if (attributes.threeDSecureToken != null) {
      console.warn(
        "[DEPRECATED] `threeDSecureToken` is a deprecated param for transaction.sale calls. Use `threeDSecureAuthenticationId` instead"
      );
    }

    if (attributes.venmoSdkPaymentMethodCode != null) {
      console.warn(
        "The Venmo SDK integration is Unsupported. Please update your integration to use Pay with Venmo instead (https://developer.paypal.com/braintree/docs/guides/venmo/overview)"
      );
    }

    if (
      attributes.options != null &&
      attributes.options.venmoSdkSession != null
    ) {
      console.warn(
        "The Venmo SDK integration is Unsupported. Please update your integration to use Pay with Venmo instead (https://developer.paypal.com/braintree/docs/guides/venmo/overview)"
      );
    }
  }
}

module.exports = {
  TransactionGateway: wrapPrototype(TransactionGateway, {
    ignoreMethods: ["search"],
  }),
};

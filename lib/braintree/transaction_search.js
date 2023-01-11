"use strict";

let AdvancedSearch = require("./advanced_search").AdvancedSearch;
let Transaction = require("./transaction").Transaction;
let CreditCard = require("./credit_card").CreditCard;

class TransactionSearch extends AdvancedSearch {
  static initClass() {
    this.textFields(
      "billingCompany",
      "billingCountryName",
      "billingExtendedAddress",
      "billingFirstName",
      "billingLastName",
      "billingLocality",
      "billingPostalCode",
      "billingRegion",
      "billingStreetAddress",
      "creditCardCardholderName",
      "creditCardUniqueIdentifier",
      "currency",
      "customerCompany",
      "customerEmail",
      "customerFax",
      "customerFirstName",
      "customerId",
      "customerLastName",
      "customerPhone",
      "customerWebsite",
      "id",
      "orderId",
      "paymentMethodToken",
      "paypalPayerEmail",
      "paypalPaymentId",
      "paypalAuthorizationId",
      "processorAuthorizationCode",
      "sepaDebitPaypalV2_OrderId",
      "settlementBatchId",
      "shippingCompany",
      "shippingCountryName",
      "shippingExtendedAddress",
      "shippingFirstName",
      "shippingLastName",
      "shippingLocality",
      "shippingPostalCode",
      "shippingRegion",
      "shippingStreetAddress",
      "storeId"
    );

    this.equalityFields("creditCardExpirationDate");
    this.partialMatchFields("creditCardNumber");
    this.multipleValueField("createdUsing", {
      allows: [
        Transaction.CreatedUsing.FullInformation,
        Transaction.CreatedUsing.Token,
      ],
    });
    this.multipleValueField("creditCardCardType", {
      // eslint-disable-next-line new-cap
      allows: CreditCard.CardType.All(),
    });
    this.multipleValueField("creditCardCustomerLocation", {
      allows: [
        CreditCard.CustomerLocation.International,
        CreditCard.CustomerLocation.US,
      ],
    });
    this.multipleValueField("ids");
    this.multipleValueField("user");
    this.multipleValueField("paymentInstrumentType");
    this.multipleValueField("merchantAccountId");
    this.multipleValueField("status", { allows: Transaction.Status.All() }); // eslint-disable-line new-cap
    this.multipleValueField("source");
    this.multipleValueField("type", { allows: Transaction.Type.All() }); // eslint-disable-line new-cap
    this.multipleValueField("storeIds");
    this.multipleValueField("reasonCode");
    this.keyValueFields("refund");
    this.rangeFields(
      "amount",
      "authorizationExpiredAt",
      "authorizedAt",
      "createdAt",
      "disbursementDate",
      "disputeDate",
      "failedAt",
      "gatewayRejectedAt",
      "processorDeclinedAt",
      "settledAt",
      "submittedForSettlementAt",
      "voidedAt",
      "achReturnResponsesCreatedAt"
    );
  }
}
TransactionSearch.initClass();

module.exports = { TransactionSearch: TransactionSearch };

{AdvancedSearch} = require("./advanced_search")
{Transaction} = require("./transaction")
{CreditCard} = require("./credit_card")

class TransactionSearch extends AdvancedSearch
    @textFields(
      "billingCompany"
      "billingCountryName"
      "billingExtendedAddress"
      "billingFirstName"
      "billingLastName"
      "billingLocality"
      "billingPostalCode"
      "billingRegion"
      "billingStreetAddress"
      "creditCardCardholderName"
      "currency"
      "customerCompany"
      "customerEmail"
      "customerFax"
      "customerFirstName"
      "customerId"
      "customerLastName"
      "customerPhone"
      "customerWebsite"
      "id"
      "orderId"
      "paymentMethodToken"
      "paypalPayerEmail"
      "paypalPaymentId"
      "paypalAuthorizationId"
      "processorAuthorizationCode"
      "settlementBatchId"
      "shippingCompany"
      "shippingCountryName"
      "shippingExtendedAddress"
      "shippingFirstName"
      "shippingLastName"
      "shippingLocality"
      "shippingPostalCode"
      "shippingRegion"
      "shippingStreetAddress"
      "creditCardUniqueIdentifier"
    )

    @equalityFields "creditCardExpirationDate"
    @partialMatchFields "creditCardNumber"
    @multipleValueField "createdUsing", { "allows" : [
      Transaction.CreatedUsing.FullInformation,
      Transaction.CreatedUsing.Token
    ]}
    @multipleValueField "creditCardCardType", { "allows" : CreditCard.CardType.All() }
    @multipleValueField "creditCardCustomerLocation", { "allows" : [
      CreditCard.CustomerLocation.International,
      CreditCard.CustomerLocation.US
    ]}
    @multipleValueField "ids"
    @multipleValueField "user"
    @multipleValueField "merchantAccountId"
    @multipleValueField "status", { "allows" : Transaction.Status.All() }
    @multipleValueField "source", { "allows" : [
      Transaction.Source.Api,
      Transaction.Source.ControlPanel,
      Transaction.Source.Recurring
    ]}
    @multipleValueField "type", { "allows" : Transaction.Type.All() }
    @keyValueFields "refund"
    @rangeFields(
      "amount"
      "authorizationExpiredAt"
      "authorizedAt"
      "createdAt"
      "disbursementDate"
      "disputeDate"
      "failedAt"
      "gatewayRejectedAt"
      "processorDeclinedAt"
      "settledAt"
      "submittedForSettlementAt"
      "voidedAt"
    )

exports.TransactionSearch = TransactionSearch

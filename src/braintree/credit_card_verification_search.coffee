{AdvancedSearch} = require('./advanced_search')
{CreditCard} = require('./credit_card')
{CreditCardVerification} = require('./credit_card_verification')

class CreditCardVerificationSearch extends AdvancedSearch
    @textFields(
      "billingAddressDetailsPostalCode"
      "creditCardCardholderName"
      "customerEmail"
      "customerId"
      "id"
      "paymentMethodToken"
    )

    @equalityFields "creditCardExpirationDate"

    @partialMatchFields "creditCardNumber"

    @multipleValueField "creditCardCardType", { "allows" : CreditCard.CardType.All() }
    @multipleValueField "status", { "allows" : CreditCardVerification.StatusType.All() }
    @multipleValueField "ids"

    @rangeFields("createdAt")


exports.CreditCardVerificationSearch = CreditCardVerificationSearch

{AdvancedSearch} = require('./advanced_search')
{CreditCard} = require('./credit_card')

class CreditCardVerificationSearch extends AdvancedSearch
    @textFields(
      "customerId"
      "customerEmail"
      "creditCardCardholderName"
      "id"
      "billingAddressDetailsPostalCode"
    )

    @equalityFields "creditCardExpirationDate"

    @partialMatchFields "creditCardNumber"

    @multipleValueField "creditCardCardType", { "allows" : CreditCard.CardType.All() }
    @multipleValueField "ids"

    @rangeFields("createdAt")


exports.CreditCardVerificationSearch = CreditCardVerificationSearch

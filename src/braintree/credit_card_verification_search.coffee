{AdvancedSearch} = require('./advanced_search')
{CreditCard} = require('./credit_card')

class CreditCardVerificationSearch extends AdvancedSearch
    @textFields(
      "creditCardCardholderName"
      "id"
    )

    @equalityFields "creditCardExpirationDate"

    @partialMatchFields "creditCardNumber"

    @multipleValueField "creditCardCardType", { "allows" : CreditCard.CardType.All() }
    @multipleValueField "ids"

    @rangeFields("createdAt")


exports.CreditCardVerificationSearch = CreditCardVerificationSearch

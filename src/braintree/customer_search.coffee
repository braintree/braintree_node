{AdvancedSearch} = require('./advanced_search')

class CustomerSearch extends AdvancedSearch
  @textFields(
    "addressCountryName"
    "addressExtendedAddress"
    "addressFirstName"
    "addressLastName"
    "addressLocality"
    "addressPostalCode"
    "addressRegion"
    "addressStreetAddress"
    "cardholderName"
    "company"
    "email"
    "fax"
    "firstName"
    "id"
    "lastName"
    "paymentMethodToken"
    "paypalAccountEmail"
    "phone"
    "website"
    "paymentMethodTokenWithDuplicates"
  )

  @equalityFields "creditCardExpirationDate"
  @partialMatchFields "creditCardNumber"
  @multipleValueField "ids"
  @rangeFields "createdAt"

exports.CustomerSearch = CustomerSearch

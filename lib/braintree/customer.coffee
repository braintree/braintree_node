{CreditCard} = require('./credit_card')

class Customer
  constructor: (attributes) ->
    for key, value of attributes
      @[key] = value
    @creditCards = (new CreditCard(cardAttributes) for cardAttributes in attributes.creditCards)

exports.Customer = Customer

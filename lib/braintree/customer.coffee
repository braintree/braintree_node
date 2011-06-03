{CreditCard} = require('./credit_card')

Customer = (attributes) ->
  that = {}
  for key, value of attributes
    that[key] = value
  that.creditCards = (new CreditCard(cardAttributes) for cardAttributes in attributes.creditCards)
  that

exports.Customer = Customer

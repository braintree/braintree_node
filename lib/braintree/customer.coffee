CreditCard = require('./credit_card').CreditCard

Customer = (attributes) ->
  that = {}
  for key, value of attributes
    that[key] = value
  that.creditCards = (CreditCard(cardAttributes) for cardAttributes in attributes.creditCards)
  that

exports.Customer = Customer

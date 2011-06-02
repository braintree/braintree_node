{CreditCard} = require('./credit_card')

Transaction = (attributes) ->
  that = {}
  for key, value of attributes
    that[key] = value
  that.creditCard = CreditCard(attributes.creditCard)
  that

exports.Transaction = Transaction

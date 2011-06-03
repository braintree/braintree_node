{CreditCard} = require('./credit_card')

class Transaction
  constructor: (attributes) ->
    for key, value of attributes
      @[key] = value
    @creditCard = new CreditCard(attributes.creditCard)

exports.Transaction = Transaction

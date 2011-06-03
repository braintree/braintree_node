{Transaction} = require('./transaction')

class Subscription
  constructor: (attributes) ->
    for key, value of attributes
      @[key] = value
    @transactions = (new Transaction(transactionAttributes) for transactionAttributes in attributes.transactions)

exports.Subscription = Subscription

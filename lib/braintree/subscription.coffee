{Transaction} = require('./transaction')

Subscription = (attributes) ->
  that = {}
  for key, value of attributes
    that[key] = value
  that.transactions = (Transaction(transactionAttributes) for transactionAttributes in attributes.transactions)
  that

exports.Subscription = Subscription

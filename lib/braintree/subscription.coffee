{AttributeSetter} = require('./attribute_setter')
{Transaction} = require('./transaction')

class Subscription extends AttributeSetter
  @Status =
    Active : 'Active'
    Canceled : 'Canceled'
    Expired : 'Expired'
    PastDue : 'Past Due'
    Pending : 'Pending'
    All : ->
      all = []
      for key, value of @
        all.push value if key isnt 'All'
      all

  constructor: (attributes) ->
    super attributes
    @transactions = (new Transaction(transactionAttributes) for transactionAttributes in attributes.transactions)

exports.Subscription = Subscription

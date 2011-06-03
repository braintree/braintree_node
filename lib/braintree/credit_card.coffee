class CreditCard
  constructor: (attributes) ->
    for key, value of attributes
      @[key] = value
    @maskedNumber = "#{@bin}******#{@last4}"
    @expirationDate = "#{@expirationMonth}/#{@expirationYear}"

exports.CreditCard = CreditCard

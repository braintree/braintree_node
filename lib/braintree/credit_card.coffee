CreditCard = (attributes) ->
  that = {}
  for key, value of attributes
    that[key] = value
  that.maskedNumber = that.bin + '******' + that.last4
  that.expirationDate = that.expirationMonth + '/' + that.expirationYear
  that

exports.CreditCard = CreditCard

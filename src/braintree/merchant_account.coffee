{AttributeSetter} = require('./attribute_setter')

class MerchantAccount extends AttributeSetter
  @Status =
    Pending : "pending"

  constructor: (attributes) ->
    super attributes
    if attributes.masterMerchantAccount
      @masterMerchantAccount = new MerchantAccount(attributes.masterMerchantAccount)

exports.MerchantAccount = MerchantAccount

{AttributeSetter} = require('./attribute_setter')

class MerchantAccount extends AttributeSetter
  @Status =
    Pending : "pending"
    Active : "active"
    Suspended : "suspended"

  @FundingDestination =
    Bank : "bank"
    Email : "email"
    MobilePhone : "mobile_phone"

  constructor: (attributes) ->
    super attributes
    if attributes.masterMerchantAccount
      @masterMerchantAccount = new MerchantAccount(attributes.masterMerchantAccount)

exports.MerchantAccount = MerchantAccount

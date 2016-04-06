{AttributeSetter} = require('./attribute_setter')
{MerchantAccount} = require('./merchant_account')

class Merchant extends AttributeSetter
  constructor: (attributes) ->
    super attributes

    if attributes.merchantAccounts
      @merchantAccounts = (new MerchantAccount(merchantAccountAttributes) for merchantAccountAttributes in attributes.merchantAccounts)

exports.Merchant = Merchant

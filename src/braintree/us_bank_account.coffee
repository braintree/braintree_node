{AttributeSetter} = require('./attribute_setter')
{AchMandate} = require('./ach_mandate')

class UsBankAccount extends AttributeSetter
  constructor: (attributes) ->
    super attributes
    @achMandate = new AchMandate(@achMandate)

exports.UsBankAccount = UsBankAccount

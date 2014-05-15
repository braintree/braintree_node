{AttributeSetter} = require('./attribute_setter')
{CreditCard} = require('./credit_card')
{PayPalAccount} = require('./paypal_account')

class Customer extends AttributeSetter
  constructor: (attributes) ->
    super attributes
    if attributes.creditCards
      @creditCards = (new CreditCard(cardAttributes) for cardAttributes in attributes.creditCards)
    else if attributes.paypalAccounts
      @paypalAccounts = (new PayPalAccount(paypalAccountAttributes) for paypalAccountAttributes in attributes.paypalAccounts)

exports.Customer = Customer

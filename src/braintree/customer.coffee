{AttributeSetter} = require('./attribute_setter')
{ApplePayCard} = require('./apple_pay_card')
{CreditCard} = require('./credit_card')
{PayPalAccount} = require('./paypal_account')

class Customer extends AttributeSetter
  constructor: (attributes) ->
    super attributes
    if attributes.creditCards
      @creditCards = (new CreditCard(cardAttributes) for cardAttributes in attributes.creditCards)
    if attributes.applePayCards
      @applePayCards = (new ApplePayCard(cardAttributes) for cardAttributes in attributes.applePayCards)
    if attributes.paypalAccounts
      @paypalAccounts = (new PayPalAccount(paypalAccountAttributes) for paypalAccountAttributes in attributes.paypalAccounts)

exports.Customer = Customer

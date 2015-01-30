{AttributeSetter} = require('./attribute_setter')
{ApplePayCard} = require('./apple_pay_card')
{CreditCard} = require('./credit_card')
{PayPalAccount} = require('./paypal_account')
{CoinbaseAccount} = require('./coinbase_account')

class Customer extends AttributeSetter
  constructor: (attributes) ->
    super attributes
    @paymentMethods = []
    if attributes.creditCards
      @creditCards = (new CreditCard(cardAttributes) for cardAttributes in attributes.creditCards)
      for paymentMethod in @creditCards
        @paymentMethods.push paymentMethod
    if attributes.applePayCards
      @applePayCards = (new ApplePayCard(cardAttributes) for cardAttributes in attributes.applePayCards)
      for paymentMethod in @applePayCards
        @paymentMethods.push paymentMethod
    if attributes.paypalAccounts
      @paypalAccounts = (new PayPalAccount(paypalAccountAttributes) for paypalAccountAttributes in attributes.paypalAccounts)
      for paymentMethod in @paypalAccounts
        @paymentMethods.push paymentMethod
    if attributes.coinbaseAccounts
      @coinbaseAccounts = (new CoinbaseAccount(coinbaseAccountAttributes) for coinbaseAccountAttributes in attributes.coinbaseAccounts)
      for paymentMethod in @coinbaseAccounts
        @paymentMethods.push paymentMethod

exports.Customer = Customer

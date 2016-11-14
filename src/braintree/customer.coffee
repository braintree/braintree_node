{AttributeSetter} = require('./attribute_setter')
{ApplePayCard} = require('./apple_pay_card')
{AndroidPayCard} = require('./android_pay_card')
{AmexExpressCheckoutCard} = require('./amex_express_checkout_card')
{CreditCard} = require('./credit_card')
{PayPalAccount} = require('./paypal_account')
{CoinbaseAccount} = require('./coinbase_account')
{VenmoAccount} = require('./venmo_account')
{UsBankAccount} = require('./us_bank_account')

class Customer extends AttributeSetter
  constructor: (attributes) ->
    super attributes
    @paymentMethods = []
    if attributes.creditCards
      @creditCards = (new CreditCard(cardAttributes) for cardAttributes in attributes.creditCards)
      @_addPaymentMethods(@creditCards)
    if attributes.applePayCards
      @applePayCards = (new ApplePayCard(cardAttributes) for cardAttributes in attributes.applePayCards)
      @_addPaymentMethods(@applePayCards)
    if attributes.androidPayCards
      @androidPayCards = (new AndroidPayCard(cardAttributes) for cardAttributes in attributes.androidPayCards)
      @_addPaymentMethods(@androidPayCards)
    if attributes.amexExpressCheckoutCards
      @amexExpressCheckoutCards = (new AmexExpressCheckoutCard(cardAttributes) for cardAttributes in attributes.amexExpressCheckoutCards)
      @_addPaymentMethods(@amexExpressCheckoutCards)
    if attributes.paypalAccounts
      @paypalAccounts = (new PayPalAccount(paypalAccountAttributes) for paypalAccountAttributes in attributes.paypalAccounts)
      @_addPaymentMethods(@paypalAccounts)
    if attributes.coinbaseAccounts
      @coinbaseAccounts = (new CoinbaseAccount(coinbaseAccountAttributes) for coinbaseAccountAttributes in attributes.coinbaseAccounts)
      @_addPaymentMethods(@coinbaseAccounts)
    if attributes.venmoAccounts
      @venmoAccounts = (new VenmoAccount(venmoAccountAttributes) for venmoAccountAttributes in attributes.venmoAccounts)
      @_addPaymentMethods(@venmoAccounts)
    if attributes.usBankAccounts
      @usBankAccounts = (new UsBankAccount(usBankAccountAttributes) for usBankAccountAttributes in attributes.usBankAccounts)
      @_addPaymentMethods(@usBankAccounts)

  _addPaymentMethods: (paymentMethods) ->
    for paymentMethod in paymentMethods
      @paymentMethods.push paymentMethod

exports.Customer = Customer

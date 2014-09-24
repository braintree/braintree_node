{Config} = require("./braintree/config")
{Environment} = require("./braintree/environment")
{BraintreeGateway} = require("./braintree/braintree_gateway")
errorTypes = require("./braintree/error_types")

{Transaction} = require("./braintree/transaction")
{CreditCard} = require("./braintree/credit_card")
{Subscription} = require("./braintree/subscription")
{MerchantAccount} = require("./braintree/merchant_account")
{PaymentInstrumentTypes} = require("./braintree/payment_instrument_types")
{WebhookNotification} = require("./braintree/webhook_notification")

{CreditCardDefaults} = require("./braintree/test/credit_card_defaults")
{CreditCardNumbers} = require("./braintree/test/credit_card_numbers")
{MerchantAccountTest} = require("./braintree/test/merchant_account")
{Nonces} = require("./braintree/test/nonces")
{TransactionAmounts} = require("./braintree/test/transaction_amounts")
{VenmoSdk} = require("./braintree/test/venmo_sdk")

connect = (config) ->
  new BraintreeGateway(new Config(config))

exports.connect = connect
exports.version = '1.19.0'
exports.Environment = Environment
exports.errorTypes = errorTypes

exports.Transaction = Transaction
exports.CreditCard = CreditCard
exports.Subscription = Subscription
exports.MerchantAccount = MerchantAccount
exports.WebhookNotification = WebhookNotification

exports.Test = {
  CreditCardDefaults: CreditCardDefaults,
  CreditCardNumbers: CreditCardNumbers,
  MerchantAccountTest: MerchantAccountTest,
  Nonces: Nonces,
  TransactionAmounts: TransactionAmounts,
}

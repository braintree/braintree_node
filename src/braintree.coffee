{Config} = require("./braintree/config")
{Environment} = require("./braintree/environment")
{BraintreeGateway} = require("./braintree/braintree_gateway")
errorTypes = require("./braintree/error_types")

{Transaction} = require("./braintree/transaction")
{CreditCard} = require("./braintree/credit_card")
{Subscription} = require("./braintree/subscription")
{MerchantAccount} = require("./braintree/merchant_account")
{WebhookNotification} = require("./braintree/webhook_notification")

connect = (config) ->
  new BraintreeGateway(new Config(config))

exports.connect = connect
exports.version = '1.14.1'
exports.Environment = Environment
exports.errorTypes = errorTypes

exports.Transaction = Transaction
exports.CreditCard = CreditCard
exports.Subscription = Subscription
exports.MerchantAccount = MerchantAccount
exports.WebhookNotification = WebhookNotification

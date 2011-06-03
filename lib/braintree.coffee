sys = require "sys"
{Config} = require("./braintree/config")
{Environment} = require("./braintree/environment")
{Gateway} = require("./braintree/gateway")
{AddressGateway} = require("./braintree/address_gateway")
{CreditCardGateway} = require("./braintree/credit_card_gateway")
{CustomerGateway} = require("./braintree/customer_gateway")
{SubscriptionGateway} = require("./braintree/subscription_gateway")
{TransactionGateway} = require("./braintree/transaction_gateway")
{TransparentRedirectGateway} = require("./braintree/transparent_redirect_gateway")
errorTypes = require("./braintree/error_types")

connect = (config) ->
  gateway = new Gateway(new Config(config))

  {
    _gateway: gateway,
    address: new AddressGateway(gateway)
    creditCard: new CreditCardGateway(gateway)
    customer: new CustomerGateway(gateway)
    subscription: new SubscriptionGateway(gateway)
    transaction: new TransactionGateway(gateway)
    transparentRedirect: TransparentRedirectGateway(gateway)
  }

exports.connect = connect
exports.version = '0.2.0'
exports.Environment = Environment
exports.errorTypes = errorTypes

require('coffee-script');

var sys = require("sys"),
    Config = require("./braintree/config").Config,
    Environment = require("./braintree/environment").Environment,
    Gateway = require("./braintree/gateway").Gateway,
    AddressGateway = require("./braintree/address_gateway").AddressGateway,
    CreditCardGateway = require("./braintree/credit_card_gateway").CreditCardGateway,
    CustomerGateway = require("./braintree/customer_gateway").CustomerGateway,
    SubscriptionGateway = require("./braintree/subscription_gateway").SubscriptionGateway,
    TransactionGateway = require("./braintree/transaction_gateway").TransactionGateway,
    TransparentRedirectGateway = require("./braintree/transparent_redirect_gateway").TransparentRedirectGateway,
    errorTypes = require("./braintree/error_types");

var connect = function(config) {
  var gateway = Gateway(Config(config));
  return {
    _gateway: gateway,
    address: AddressGateway(gateway),
    creditCard: CreditCardGateway(gateway),
    customer: CustomerGateway(gateway),
    subscription: SubscriptionGateway(gateway),
    transaction: TransactionGateway(gateway),
    transparentRedirect: TransparentRedirectGateway(gateway)
  };
};

exports.connect = connect;
exports.version = '0.1.0';
exports.Environment = Environment;
exports.errorTypes = errorTypes;

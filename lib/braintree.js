var sys = require("sys"),
    Config = require("./braintree/config").Config,
    Environment = require("./braintree/environment").Environment,
    Gateway = require("./braintree/gateway").Gateway,
    CreditCardGateway = require("./braintree/credit_card_gateway").CreditCardGateway,
    CustomerGateway = require("./braintree/customer_gateway").CustomerGateway,
    SubscriptionGateway = require("./braintree/subscription_gateway").SubscriptionGateway,
    TransactionGateway = require("./braintree/transaction_gateway").TransactionGateway,
    TransparentRedirectGateway = require("./braintree/transparent_redirect_gateway").TransparentRedirectGateway,
    AuthenticationError = require("./braintree/exceptions/authentication_error").AuthenticationError,
    errorTypes = require("./braintree/exceptions/error_types");

if (process.version !== 'v0.4.7') {
  sys.puts('WARNING: node.js version ' + process.version + ' has not been tested with the braintree library');
}

var connect = function(config) {
  var gateway = Gateway(Config(config));
  return {
    _gateway: gateway,
    creditCard: CreditCardGateway(gateway),
    customer: CustomerGateway(gateway),
    subscription: SubscriptionGateway(gateway),
    transaction: TransactionGateway(gateway),
    transparentRedirect: TransparentRedirectGateway(gateway)
  };
};

exports.connect = connect;
exports.version = '0.1.0';
exports.AuthenticationError = AuthenticationError;
exports.Environment = Environment;
exports.errorTypes = errorTypes;

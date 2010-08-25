GLOBAL.sys = require('sys');
GLOBAL.vows = require('vows');
GLOBAL.assert = require('assert');

GLOBAL.inspect = function (object) {
  sys.puts(sys.inspect(object));
};

GLOBAL.braintree = require('./../lib/braintree');

var defaultConfig = {
  environment: braintree.Environment.Development,
  merchantId: 'integration_merchant_id',
  publicKey: 'integration_public_key',
  privateKey: 'integration_private_key'
};

var defaultGateway = braintree.connect(defaultConfig);

GLOBAL.specHelper = {
  defaultConfig: defaultConfig,
  defaultGateway: defaultGateway
}

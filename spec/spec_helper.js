GLOBAL.sys = require('sys');
GLOBAL.vows = require('vows');
GLOBAL.assert = require('assert');

GLOBAL.assert.isEmptyArray = function (array) {
  assert.isArray(array);
  assert.equal(array.length, 0);
};

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

var plans = {
  trialless: {id: 'integration_trialless_plan', price: '12.34'}
};

GLOBAL.specHelper = {
  defaultConfig: defaultConfig,
  defaultGateway: defaultGateway,
  plans: plans
}

var http = require('http'),
    Util = require('../lib/braintree/util').Util,
    querystring = require('../vendor/querystring.node.js/querystring');

GLOBAL.vows = require('vows');
GLOBAL.assert = require('assert');

GLOBAL.assert.isEmptyArray = function (array) {
  assert.isArray(array);
  assert.equal(array.length, 0);
};

GLOBAL.inspect = function (object) {
  sys.puts(sys.inspect(object));
};

var braintree = require('./../lib/braintree');

var defaultConfig = {
  environment: braintree.Environment.Development,
  merchantId: 'integration_merchant_id',
  publicKey: 'integration_public_key',
  privateKey: 'integration_private_key'
};

var defaultGateway = braintree.connect(defaultConfig);

var multiplyString = function (string, times) {
  return (new Array(times+1)).join(string);
};

var plans = {
  trialless: {id: 'integration_trialless_plan', price: '12.34'}
};

var simulateTrFormPost = function (url, trData, inputFormData, callback) {
  var client = http.createClient(
    specHelper.defaultGateway._gateway.config.environment.port,
    specHelper.defaultGateway._gateway.config.environment.server,
    specHelper.defaultGateway._gateway.config.environment.ssl
  );
  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Host': 'localhost'
  };
  var formData = Util.convertObjectKeysToUnderscores(inputFormData);
  formData.tr_data = trData;
  var requestBody = querystring.stringify(formData);
  headers['Content-Length'] = requestBody.length.toString();
  var request = client.request('POST', url, headers);
  request.write(requestBody);
  request.end();
  request.on('response', function (response) {
    callback(null, response.headers.location.split('?', 2)[1]);
  });
};

GLOBAL.specHelper = {
  braintree: braintree,
  defaultConfig: defaultConfig,
  defaultGateway: defaultGateway,
  multiplyString: multiplyString,
  plans: plans,
  simulateTrFormPost: simulateTrFormPost
}

http = require('http')
Util = require('../lib/braintree/util').Util
querystring = require('../vendor/querystring.node.js.511d6a2/querystring')
sys = require('sys')

GLOBAL.vows = require('vows')
GLOBAL.assert = require('assert')

GLOBAL.assert.isEmptyArray = (array) ->
  assert.isArray(array)
  assert.equal(array.length, 0)

GLOBAL.inspect = (object) ->
  sys.puts(sys.inspect(object))

braintree = require('./../lib/braintree')

defaultConfig = {
  environment: braintree.Environment.Development
  merchantId: 'integration_merchant_id'
  publicKey: 'integration_public_key'
  privateKey: 'integration_private_key'
}

defaultGateway = braintree.connect(defaultConfig)

multiplyString = (string, times) ->
  (new Array(times+1)).join(string)

plans = {
  trialless: {id: 'integration_trialless_plan', price: '12.34'}
}

simulateTrFormPost = (url, trData, inputFormData, callback) ->
  client = http.createClient(
    specHelper.defaultGateway._gateway.config.environment.port,
    specHelper.defaultGateway._gateway.config.environment.server,
    specHelper.defaultGateway._gateway.config.environment.ssl
  )
  headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Host': 'localhost'
  }
  formData = Util.convertObjectKeysToUnderscores(inputFormData)
  formData.tr_data = trData
  requestBody = querystring.stringify(formData)
  headers['Content-Length'] = requestBody.length.toString()
  request = client.request('POST', url, headers)
  request.write(requestBody)
  request.end()
  request.on('response', (response) ->
    callback(null, response.headers.location.split('?', 2)[1])
  )

GLOBAL.specHelper = {
  braintree: braintree
  defaultConfig: defaultConfig
  defaultGateway: defaultGateway
  multiplyString: multiplyString
  plans: plans
  simulateTrFormPost: simulateTrFormPost
}

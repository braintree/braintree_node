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
  trialless: { id: 'integration_trialless_plan', price: '12.34' }
  addonDiscountPlan: {
    id: 'integration_plan_with_add_ons_and_discounts',
    price: '9.99'
  }
}

addOns = {
  increase10: 'increase_10'
  increase20: 'increase_20'
}

makePastDue = (subscription, callback) ->
  defaultGateway._gateway.http.put(
    "/subscriptions/#{subscription.id}/make_past_due?days_past_due=1",
    null,
    callback
  )

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
  addOns: addOns
  braintree: braintree
  defaultConfig: defaultConfig
  defaultGateway: defaultGateway
  makePastDue: makePastDue
  multiplyString: multiplyString
  plans: plans
  simulateTrFormPost: simulateTrFormPost
}

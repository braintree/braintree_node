http = require('http')
{Util} = require('../lib/braintree/util')
querystring = require('../vendor/querystring.node.js.511d6a2/querystring')

GLOBAL.vows = require('vows')
GLOBAL.assert = require('assert')

GLOBAL.assert.isEmptyArray = (array) ->
  assert.isArray(array)
  assert.equal(array.length, 0)

GLOBAL.inspect = (object) ->
  console.dir(object)

braintree = require('./../lib/braintree.js')

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
  defaultGateway.http.put(
    "/subscriptions/#{subscription.id}/make_past_due?days_past_due=1",
    null,
    callback
  )

settleTransaction = (transactionId, callback) ->
  defaultGateway.http.put(
    "/transactions/#{transactionId}/settle",
    null,
    callback
  )

simulateTrFormPost = (url, trData, inputFormData, callback) ->
  headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Host': 'localhost'
  }
  formData = Util.convertObjectKeysToUnderscores(inputFormData)
  formData.tr_data = trData
  requestBody = querystring.stringify(formData)
  headers['Content-Length'] = requestBody.length.toString()

  options = {
    port: specHelper.defaultGateway.config.environment.port
    host: specHelper.defaultGateway.config.environment.server
    method: 'POST'
    headers: headers
    path: url
  }

  if specHelper.defaultGateway.config.environment.ssl
    request = https.request(options, ->)
  else
    request = http.request(options, ->)

  request.on('response', (response) ->
    callback(null, response.headers.location.split('?', 2)[1])
  )

  request.write(requestBody)
  request.end()

dateToMdy = (date) ->
  year = date.getFullYear().toString()
  month = (date.getMonth() + 1).toString()
  day = date.getDate().toString()
  if month.length == 1
    month = "0" + month
  if day.length == 1
    day = "0" + day
  formattedDate = year + '-' + month + '-' + day
  return formattedDate

nowInEastern = ->
  now = new Date
  eastern = now.getTime() - (5*60*60*1000)
  return new Date(eastern)

randomId = ->
  Math.floor(Math.random() * Math.pow(36,8)).toString(36)

doesNotInclude = (array, value) ->
  assert.isTrue(array.indexOf(value) is -1)

GLOBAL.specHelper = {
  addOns: addOns
  braintree: braintree
  dateToMdy: dateToMdy
  defaultConfig: defaultConfig
  defaultGateway: defaultGateway
  doesNotInclude: doesNotInclude
  makePastDue: makePastDue
  multiplyString: multiplyString
  nowInEastern: nowInEastern
  plans: plans
  randomId: randomId
  settleTransaction: settleTransaction
  simulateTrFormPost: simulateTrFormPost
}

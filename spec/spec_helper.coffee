try
  require('source-map-support').install
    handleUncaughtExceptions: false
catch err

http = require('http')
{TransactionAmounts} = require('../lib/braintree/test/transaction_amounts')
{Nonces} = require('../lib/braintree/test/nonces')
{Util} = require('../lib/braintree/util')
{Config} = require('../lib/braintree/config')
querystring = require('../vendor/querystring.node.js.511d6a2/querystring')
chai = require("chai")
{Buffer} = require('buffer')
xml2js = require('xml2js')

chai.Assertion.includeStack = true

GLOBAL.assert = chai.assert

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

escrowTransaction = (transactionId, callback) ->
  defaultGateway.http.put(
    "#{defaultGateway.config.baseMerchantPath()}/transactions/#{transactionId}/escrow",
    null,
    callback
  )

makePastDue = (subscription, callback) ->
  defaultGateway.http.put(
    "#{defaultGateway.config.baseMerchantPath()}/subscriptions/#{subscription.id}/make_past_due?days_past_due=1",
    null,
    callback
  )

settlePayPalTransaction = (transactionId, callback) ->
  defaultGateway.http.put(
    "#{defaultGateway.config.baseMerchantPath()}/transactions/#{transactionId}/settle",
    null,
    callback
  )

create3DSVerification = (merchantAccountId, params, callback) ->
  responseCallback = (err, response) ->
    threeDSecureToken = response.threeDSecureVerification.threeDSecureToken
    callback(threeDSecureToken)

  defaultGateway.http.post(
    "#{defaultGateway.config.baseMerchantPath()}/three_d_secure/create_verification/#{merchantAccountId}",
    {three_d_secure_verification: params},
    responseCallback
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

settlementDate = (date) ->
  now_in_utc = date
  eastern_time = new Date(now_in_utc.getTime() - (4*60*60*1000))

  if now_in_utc.getDate().toString() != eastern_time.getDate().toString()
    return eastern_time
  else
    return now_in_utc

randomId = ->
  Math.floor(Math.random() * Math.pow(36,8)).toString(36)

doesNotInclude = (array, value) ->
  assert.isTrue(array.indexOf(value) is -1)

generateNonceForNewPaymentMethod = (paymentMethodParams, customerId, callback) ->
  myHttp = new ClientApiHttp(new Config(specHelper.defaultConfig))
  clientTokenOptions = {}
  clientTokenOptions.customerId = customerId if customerId
  specHelper.defaultGateway.clientToken.generate(clientTokenOptions, (err, result) ->
    clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
    params = { authorizationFingerprint: clientToken.authorizationFingerprint }

    if paymentMethodParams["paypalAccount"]?
      params["paypalAccount"] = paymentMethodParams["paypalAccount"]
      myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
        nonce = JSON.parse(body).paypalAccounts[0].nonce
        callback(nonce)
      )
    else
      params["creditCard"] = paymentMethodParams["creditCard"]
      myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, (statusCode, body) ->
        nonce = JSON.parse(body).creditCards[0].nonce
        callback(nonce)
      )
  )

createTransactionToRefund = (callback) ->
  transactionParams =
    amount: '5.00'
    creditCard:
      number: '5105105105105100'
      expirationDate: '05/2012'
    options:
      submitForSettlement: true

  specHelper.defaultGateway.transaction.sale transactionParams, (err, result) ->
    specHelper.defaultGateway.testing.settle result.transaction.id, (err, settleResult) ->
      specHelper.defaultGateway.transaction.find result.transaction.id, (err, transaction) ->
        callback(transaction)

createPayPalTransactionToRefund = (callback) ->
  nonceParams =
    paypalAccount:
      consentCode: 'PAYPAL_CONSENT_CODE'
      token: "PAYPAL_ACCOUNT_#{randomId()}"
  generateNonceForNewPaymentMethod nonceParams, null, (nonce) ->
    transactionParams =
      amount: TransactionAmounts.Authorize
      paymentMethodNonce: nonce
      options:
        submitForSettlement: true

    defaultGateway.transaction.sale transactionParams, (err, response) ->
      transactionId = response.transaction.id

      specHelper.settlePayPalTransaction transactionId, (err, settleResult) ->
        defaultGateway.transaction.find transactionId, (err, transaction) ->
          callback(transaction)
                                                                                     
createEscrowedTransaction = (callback) ->
  transactionParams =
    merchantAccountId: specHelper.nonDefaultSubMerchantAccountId
    amount: '5.00'
    serviceFeeAmount: '1.00'
    creditCard:
      number: '5105105105105100'
      expirationDate: '05/2012'
    options:
      holdInEscrow: true

  specHelper.defaultGateway.transaction.sale transactionParams, (err, result) ->
    specHelper.escrowTransaction result.transaction.id, (err, settleResult) ->
      specHelper.defaultGateway.transaction.find result.transaction.id, (err, transaction) ->
        callback(transaction)

decodeClientToken = (encodedClientToken) ->
  decodedClientToken = new Buffer(encodedClientToken, "base64").toString("utf8")
  unescapedClientToken = decodedClientToken.replace("\\u0026", "&")

  unescapedClientToken

createPlanForTests = (attributes, callback) ->
  specHelper.defaultGateway.http.post "#{defaultGateway.config.baseMerchantPath()}/plans/create_plan_for_tests", {plan: attributes}, (err, resp) ->
    callback()

createModificationForTests = (attributes, callback) ->
  specHelper.defaultGateway.http.post "#{defaultGateway.config.baseMerchantPath()}/modifications/create_modification_for_tests", {modification: attributes}, (err, resp) ->
    callback()

createToken = (gateway, attributes, callback) ->
  specHelper.createGrant gateway, attributes, (err, code) ->
    gateway.oauth.createTokenFromCode {code: code}, callback

createGrant = (gateway, attributes, callback) ->
  gateway.http.post '/oauth_testing/grants', attributes, (err, response) ->
    return callback(err, null) if err
    callback(null, response.grant.code)


class ClientApiHttp
  timeout: 60000

  constructor: (@config) ->
    @parser = new xml2js.Parser
      explicitRoot: true

  get: (url, params, callback) ->
    if params
      url += '?'
      for key, value of params
        url += "#{encodeURIComponent(key)}=#{encodeURIComponent(value)}&"
      url = url.slice(0, -1)

    @request('GET', url, null, callback)

  post: (url, body, callback) ->
    @request('POST', url, body, callback)

  checkHttpStatus: (status) ->
    switch status.toString()
      when '200', '201', '422' then null
      else status.toString()

  request: (method, url, body, callback) ->
    client = http

    options = {
      host: @config.environment.server,
      port: @config.environment.port,
      method: method,
      path: "/merchants/" + @config.merchantId + url,
      headers: {
        'X-ApiVersion': @config.apiVersion,
        'Accept': 'application/xml',
        'Content-Type': 'application/json',
        'User-Agent': 'Braintree Node ' + braintree.version
      }
    }

    if body
      requestBody = JSON.stringify(Util.convertObjectKeysToUnderscores(body))
      options.headers['Content-Length'] = Buffer.byteLength(requestBody).toString()

    theRequest = client.request(options, (response) =>
      body = ''
      response.on('data', (responseBody) -> body += responseBody )
      response.on('end', => callback(response.statusCode, body))
      response.on('error', (err) -> callback("Unexpected response error: #{err}"))
    )

    theRequest.setTimeout(@timeout, -> callback("timeout"))
    theRequest.on('error', (err) -> callback("Unexpected request error: #{err}"))

    theRequest.write(requestBody) if body
    theRequest.end()

GLOBAL.specHelper =
  addOns: addOns
  braintree: braintree
  create3DSVerification: create3DSVerification
  dateToMdy: dateToMdy
  settlementDate: settlementDate
  defaultConfig: defaultConfig
  defaultGateway: defaultGateway
  doesNotInclude: doesNotInclude
  escrowTransaction: escrowTransaction
  makePastDue: makePastDue
  multiplyString: multiplyString
  plans: plans
  randomId: randomId
  settlePayPalTransaction: settlePayPalTransaction
  simulateTrFormPost: simulateTrFormPost
  defaultMerchantAccountId: "sandbox_credit_card"
  nonDefaultMerchantAccountId: "sandbox_credit_card_non_default"
  nonDefaultSubMerchantAccountId: "sandbox_sub_merchant_account"
  threeDSecureMerchantAccountId: "three_d_secure_merchant_account"
  clientApiHttp: ClientApiHttp
  decodeClientToken: decodeClientToken
  createTransactionToRefund: createTransactionToRefund
  createPayPalTransactionToRefund: createPayPalTransactionToRefund
  createEscrowedTransaction: createEscrowedTransaction
  generateNonceForNewPaymentMethod: generateNonceForNewPaymentMethod
  createPlanForTests: createPlanForTests
  createModificationForTests: createModificationForTests
  createGrant: createGrant
  createToken: createToken

{Digest} = require('./digest')
{Util} = require('./util')
querystring = require('../../vendor/querystring.node.js.511d6a2/querystring')
dateFormat = require('dateformat')
{CreditCardGateway} = require('./credit_card_gateway')
{CustomerGateway} = require('./customer_gateway')
{TransactionGateway} = require('./transaction_gateway')
exceptions = require('./exceptions')

TransparentRedirectGateway = (gateway) ->
  KIND = {
    CREATE_CUSTOMER: 'create_customer'
    UPDATE_CUSTOMER: 'update_customer'
    CREATE_CREDIT_CARD: 'create_payment_method'
    UPDATE_CREDIT_CARD: 'update_payment_method'
    CREATE_TRANSACTION: 'create_transaction'
  }

  my = { gateway: gateway }

  generateTrData = (inputData) ->
    data = Util.convertObjectKeysToUnderscores(inputData)
    data.api_version = my.gateway.config.apiVersion
    data.time = dateFormat(new Date(), 'yyyymmddHHMMss', true)
    data.public_key = my.gateway.config.publicKey
    dataSegment = querystring.stringify(data)
    trDataHash = Digest.hexdigest(gateway.config.privateKey, dataSegment)
    trDataHash + "|" + dataSegment

  createCreditCardData = (data) ->
    data.kind = KIND.CREATE_CREDIT_CARD
    generateTrData(data)

  updateCreditCardData = (data) ->
    data.kind = KIND.UPDATE_CREDIT_CARD
    generateTrData(data)

  createCustomerData = (data) ->
    data.kind = KIND.CREATE_CUSTOMER
    generateTrData(data)

  updateCustomerData = (data) ->
    data.kind = KIND.UPDATE_CUSTOMER
    generateTrData(data)

  transactionData = (data) ->
    data.kind = KIND.CREATE_TRANSACTION
    generateTrData(data)

  validateQueryString = (queryString) ->
    matches = queryString.match(/^(.+)&hash=(.+?)$/)
    (Digest.hexdigest(gateway.config.privateKey, matches[1]) is matches[2])

  confirm = (queryString, callback) ->
    statusMatch = queryString.match(/http_status=(\d+)/)
    if statusMatch && statusMatch[1]
      error = my.gateway.http.checkHttpStatus(statusMatch[1])
      return callback(error, null) if error
    if !validateQueryString(queryString)
      return callback(exceptions.InvalidTransparentRedirectHashError(), null)
    params = querystring.parse(queryString)
    confirmCallback = null

    switch params.kind
      when KIND.CREATE_CUSTOMER, KIND.UPDATE_CUSTOMER
        confirmCallback = CustomerGateway(my.gateway).responseHandler(callback)
      when KIND.CREATE_CREDIT_CARD, KIND.UPDATE_CREDIT_CARD
        confirmCallback = new CreditCardGateway(my.gateway).responseHandler(callback)
      when KIND.CREATE_TRANSACTION
        confirmCallback = TransactionGateway(my.gateway).responseHandler(callback)
    my.gateway.http.post('/transparent_redirect_requests/' + params.id + '/confirm', null, confirmCallback)

  url = gateway.config.baseMerchantPath + '/transparent_redirect_requests'

  {
    confirm: confirm
    createCreditCardData: createCreditCardData
    createCustomerData: createCustomerData
    transactionData: transactionData
    updateCreditCardData: updateCreditCardData
    updateCustomerData: updateCustomerData
    url: url
  }

exports.TransparentRedirectGateway = TransparentRedirectGateway

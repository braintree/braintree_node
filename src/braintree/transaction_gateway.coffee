{AddressGateway} = require('./address_gateway')
{Gateway} = require('./gateway')
{Transaction} = require('./transaction')
{TransactionSearch} = require('./transaction_search')
{ErrorResponse} = require('./error_response')
{Util} = require('./util')
exceptions = require('./exceptions')
deprecate = require('depd')('braintree/gateway.transaction')

class TransactionGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  cancelRelease: (transactionId, callback) ->
    @gateway.http.put("#{@config.baseMerchantPath()}/transactions/#{transactionId}/cancel_release",
      {},
      @responseHandler(callback)
    )

  cloneTransaction: (transactionId, attributes, callback) ->
    @gateway.http.post("#{@config.baseMerchantPath()}/transactions/#{transactionId}/clone", {transactionClone: attributes}, @responseHandler(callback))

  create: (attributes, callback) ->
    @gateway.http.post("#{@config.baseMerchantPath()}/transactions", {transaction: attributes}, @responseHandler(callback))

  credit: (attributes, callback) ->
    attributes.type = 'credit'
    @create(attributes, callback)

  find: (transactionId, callback) ->
    if(transactionId.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.get "#{@config.baseMerchantPath()}/transactions/#{transactionId}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, new Transaction(response.transaction))

  holdInEscrow: (transactionId, callback) ->
    @gateway.http.put("#{@config.baseMerchantPath()}/transactions/#{transactionId}/hold_in_escrow",
      {},
      @responseHandler(callback)
    )

  refund: (transactionId, amount_or_options..., callback) ->
    options = if typeof amount_or_options[0] == 'object'
                amount_or_options[0]
              else
                amount: amount_or_options[0]
    @gateway.http.post("#{@config.baseMerchantPath()}/transactions/#{transactionId}/refund", {transaction: options}, @responseHandler(callback))

  responseHandler: (callback) ->
    @createResponseHandler("transaction", Transaction, callback)

  sale: (attributes, callback) ->
    attributes.type = 'sale'
    Util.verifyKeys(@_createSignature(), attributes, deprecate)
    @create(attributes, callback)

  search: (fn, callback) ->
    search = new TransactionSearch()
    fn(search)
    @createSearchResponse("#{@config.baseMerchantPath()}/transactions/advanced_search_ids", search, @pagingFunctionGenerator(search), callback)

  releaseFromEscrow: (transactionId, callback) ->
    @gateway.http.put("#{@config.baseMerchantPath()}/transactions/#{transactionId}/release_from_escrow",
      {},
      @responseHandler(callback)
    )

  submitForSettlement: (transactionId, attributes..., callback) ->
    amount = attributes[0]
    options = attributes[1] || {}
    deprecate("Received too many args for submitForSettlement (" + arguments.length + " for 4)") if arguments.length > 4
    Util.verifyKeys(@_submitForSettlementSignature(), options, deprecate)

    @gateway.http.put("#{@config.baseMerchantPath()}/transactions/#{transactionId}/submit_for_settlement",
      {transaction: {amount: amount, orderId: options["orderId"], descriptor: options["descriptor"]}},
      @responseHandler(callback)
    )

  updateDetails: (transactionId, options, callback) ->
    Util.verifyKeys(@_updateDetailsSignature(), options, deprecate)

    @gateway.http.put("#{@config.baseMerchantPath()}/transactions/#{transactionId}/update_details",
      {transaction: options},
      @responseHandler(callback)
    )

  submitForPartialSettlement: (transactionId, attributes..., callback) ->
    amount = attributes[0]
    options = attributes[1] || {}
    Util.verifyKeys(@_submitForSettlementSignature(), options, deprecate)

    @gateway.http.post("#{@config.baseMerchantPath()}/transactions/#{transactionId}/submit_for_partial_settlement",
      {transaction: {amount: amount, orderId: options["orderId"], descriptor: options["descriptor"]}},
      @responseHandler(callback)
    )

  void: (transactionId, callback) ->
    @gateway.http.put("#{@config.baseMerchantPath()}/transactions/#{transactionId}/void", null, @responseHandler(callback))

  pagingFunctionGenerator: (search) ->
    super search, 'transactions', Transaction, "creditCardTransactions", (response) -> response.creditCardTransactions.transaction

  _submitForSettlementSignature: ->
    {
      valid: ["orderId", "descriptor[name]", "descriptor[phone]", "descriptor[url]"]
    }

  _updateDetailsSignature: ->
    {
      valid: ["amount", "orderId", "descriptor[name]", "descriptor[phone]", "descriptor[url]"]
    }

  _createSignature: ->
    validKeys = [
      "amount",
      "customerId",
      "merchantAccountId",
      "orderId",
      "channel",
      "paymentMethodToken",
      "purchaseOrderNumber",
      "recurring",
      "transactionSource",
      "shippingAddressId",
      "type",
      "taxAmount",
      "taxExempt",
      "venmoSdkPaymentMethodCode",
      "deviceSessionId",
      "serviceFeeAmount",
      "deviceData",
      "fraudMerchantId",
      "billingAddressId",
      "paymentMethodNonce",
      "paymentMethodToken",
      "threeDSecureToken",
      "sharedPaymentMethodToken",
      "sharedBillingAddressId",
      "sharedCustomerId",
      "sharedShippingAddressId",
      "riskData",
        "riskData[customerBrowser]",
        "riskData[customerIp]",
        "riskData[customerBrowser]",
      "creditCard",
        "creditCard[token]",
        "creditCard[cardholderName]",
        "creditCard[cvv]",
        "creditCard[expirationDate]",
        "creditCard[expirationMonth]",
        "creditCard[expirationYear]",
        "creditCard[number]",
      "customer",
        "customer[id]",
        "customer[company]",
        "customer[email]",
        "customer[fax]",
        "customer[firstName]",
        "customer[lastName]",
        "customer[phone]",
        "customer[website]",
      "threeDSecurePassThru",
        "threeDSecurePassThru[eciFlag]",
        "threeDSecurePassThru[cavv]",
        "threeDSecurePassThru[xid]",
      "options",
        "options[holdInEscrow]",
        "options[storeInVault]",
        "options[storeInVaultOnSuccess]",
        "options[submitForSettlement]",
        "options[addBillingAddressToPaymentMethod]",
        "options[storeShippingAddressInVault]",
        "options[venmoSdkSession]",
        "options[payeeEmail]",
        "options[skipAdvancedFraudChecking]",
        "options[skipAvs]",
        "options[skipCvv]",
        "options[paypal]",
          "options[paypal][customField]",
          "options[paypal][payeeEmail]",
          "options[paypal][description]",
        "options[threeDSecure]",
          "options[threeDSecure][required]",
        "options[amexRewards]",
          "options[amexRewards][requestId]",
          "options[amexRewards][points]",
          "options[amexRewards][currencyAmount]",
          "options[amexRewards][currencyIsoCode]",
      "descriptor",
        "descriptor[name]",
        "descriptor[phone]",
        "descriptor[url]",
      "paypalAccount",
        "paypalAccount[email]",
        "paypalAccount[token]",
        "paypalAccount[paypalData]",
        "paypalAccount[payeeEmail]",
      "industry",
        "industry[industryType]",
        "industry[data]",
          "industry[data][folioNumber]",
          "industry[data][checkInDate]",
          "industry[data][checkOutDate]",
          "industry[data][travelPackage]",
          "industry[data][lodgingCheckInDate]",
          "industry[data][lodgingCheckOutDate]",
          "industry[data][departureDate]",
          "industry[data][lodgingName]",
          "industry[data][roomRate]",
      "applePayCard",
        "applePayCard[number]",
        "applePayCard[cardholderName]",
        "applePayCard[cryptogram]",
        "applePayCard[expirationMonth]",
        "applePayCard[expirationYear]",
      "androidPayCard",
        "androidPayCard[number]",
        "androidPayCard[cryptogram]",
        "androidPayCard[googleTransactionId]",
        "androidPayCard[expirationMonth]",
        "androidPayCard[expirationYear]",
        "androidPayCard[sourceCardType]",
        "androidPayCard[sourceCardLastFour]",
        "androidPayCard[eciIndicator]",
      "subscriptionId"
    ] + new AddressGateway(this).sharedSignature("shipping") + new AddressGateway(this).sharedSignature("billing")

    {
      valid: validKeys
      ignore: ["customFields", "options[paypal][supplementaryData]"]
    }

exports.TransactionGateway = TransactionGateway

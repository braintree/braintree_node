{Gateway} = require('./gateway')
{UsBankAccount} = require('./us_bank_account')
{TransactionGateway} = require('./transaction_gateway')
exceptions = require('./exceptions')

class UsBankAccountGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  find: (token, callback) ->
    if token.trim() == ''
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.get "#{@config.baseMerchantPath()}/payment_methods/us_bank_account/#{token}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, new UsBankAccount(response.usBankAccount))

  sale:(token, transactionRequest, callback) ->
    transactionRequest.paymentMethodToken = token
    transactionRequest.options = {} unless transactionRequest.options
    transactionRequest.options.submitForSettlement = true
    new TransactionGateway(@gateway).sale(transactionRequest, callback)

exports.UsBankAccountGateway = UsBankAccountGateway

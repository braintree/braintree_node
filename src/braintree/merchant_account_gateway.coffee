{Gateway} = require('./gateway')
{MerchantAccount} = require('./merchant_account')
exceptions = require('./exceptions')

class MerchantAccountGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  create: (attributes, callback) ->
    @gateway.http.post("#{@config.baseMerchantPath()}/merchant_accounts/create_via_api", {merchantAccount: attributes}, @responseHandler(callback))

  update: (id, attributes, callback) ->
    @gateway.http.put("#{@config.baseMerchantPath()}/merchant_accounts/#{id}/update_via_api", {merchantAccount: attributes}, @responseHandler(callback))

  find: (id, callback) ->
    if(id.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.get "#{@config.baseMerchantPath()}/merchant_accounts/#{id}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, new MerchantAccount(response.merchantAccount))

  responseHandler: (callback) ->
    @createResponseHandler("merchantAccount", MerchantAccount, callback)

  createForCurrency: (attributes, callback) ->
    @gateway.http.post("#{@config.baseMerchantPath()}/merchant_accounts/create_for_currency", {merchantAccount: attributes}, @createForCurrencyResponseHandler(callback))

  createForCurrencyResponseHandler: (callback) ->
    @createResponseHandler(null, null, (err, response) ->
      if !err && response.success
        response.merchantAccount = new MerchantAccount(response.response.merchantAccount)
        delete response.response
      callback(err, response)
    )

exports.MerchantAccountGateway = MerchantAccountGateway

{Gateway} = require('./gateway')
{CoinbaseAccount} = require('./coinbase_account')
exceptions = require('./exceptions')

class CoinbaseAccountGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  find: (token, callback) ->
    if(token.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.get "#{@config.baseMerchantPath()}/payment_methods/coinbase_account/#{token}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, new CoinbaseAccount(response.coinbaseAccount))

  delete: (token, callback) ->
    @gateway.http.delete("#{@config.baseMerchantPath()}/payment_methods/coinbase_account/#{token}", callback)

  responseHandler: (callback) ->
    @createResponseHandler("coinbaseAccount", CoinbaseAccount, callback)

exports.CoinbaseAccountGateway = CoinbaseAccountGateway

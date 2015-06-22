{Gateway} = require('./gateway')
{CreditCard} = require('./credit_card')
exceptions = require('./exceptions')

class CreditCardGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  create: (attributes, callback) ->
    @gateway.http.post("#{@config.baseMerchantPath}/payment_methods", {creditCard: attributes}, @responseHandler(callback))

  delete: (token, callback) ->
    @gateway.http.delete("#{@config.baseMerchantPath}/payment_methods/credit_card/#{token}", callback)

  find: (token, callback) ->
    if(token.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.get "#{@config.baseMerchantPath}/payment_methods/credit_card/#{token}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, new CreditCard(response.creditCard))

  fromNonce: (nonce, callback) ->
    if(nonce.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.get "#{@config.baseMerchantPath}/payment_methods/from_nonce/#{nonce}", (err, response) ->
        if err
          err.message = "Payment method with nonce " + nonce + " locked, consumed or not found"
          callback(err, null)
        else
          callback(null, new CreditCard(response.creditCard))

  update: (token, attributes, callback) ->
    @gateway.http.put("#{@config.baseMerchantPath}/payment_methods/credit_card/#{token}", {creditCard: attributes}, @responseHandler(callback))

  responseHandler: (callback) ->
    @createResponseHandler("creditCard", CreditCard, callback)

  expired: (callback) ->
    @gateway.http.post("#{@config.baseMerchantPath}/payment_methods/all/expired_ids", {}, @searchResponseHandler(@, callback))

  expiringBetween: (after, before, callback) ->
    url = "#{@config.baseMerchantPath}/payment_methods/all/expiring_ids?start=#{@dateFormat(after)}&end=#{@dateFormat(before)}"
    @gateway.http.post(url, {}, @searchResponseHandler(@, callback))

  dateFormat: (date) ->
    month = date.getMonth() + 1
    if month < 10
      month = "0#{month}"
    else
      month = "#{month}"
    return month + date.getFullYear()

exports.CreditCardGateway = CreditCardGateway

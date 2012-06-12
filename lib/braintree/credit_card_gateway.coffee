{Gateway} = require('./gateway')
{CreditCard} = require('./credit_card')
exceptions = require('./exceptions')

class CreditCardGateway extends Gateway
  constructor: (@gateway) ->

  create: (attributes, callback) ->
    @gateway.http.post('/payment_methods', {creditCard: attributes}, @responseHandler(callback))

  delete: (token, callback) ->
    @gateway.http.delete("/payment_methods/#{token}", callback)

  find: (token, callback) ->
    if(token.trim() == '')
      callback(exceptions.NotFoundError(), null)
    else
      @gateway.http.get "/payment_methods/#{token}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, new CreditCard(response.creditCard))

  update: (token, attributes, callback) ->
    @gateway.http.put("/payment_methods/#{token}", {creditCard: attributes}, @responseHandler(callback))

  responseHandler: (callback) ->
    @createResponseHandler("creditCard", CreditCard, callback)

  expired: (callback) ->
    @gateway.http.post("/payment_methods/all/expired_ids", {}, @searchResponseHandler(@, callback))

  expiringBetween: (after, before, callback) ->
    url = "/payment_methods/all/expiring_ids?start=#{@dateFormat(after)}&end=#{@dateFormat(before)}"
    @gateway.http.post(url, {}, @searchResponseHandler(@, callback))

  dateFormat: (date) ->
    month = date.getMonth() + 1
    if month < 10
      month = "0#{month}" 
    else
      month = "#{month}"
    return month + date.getFullYear()

exports.CreditCardGateway = CreditCardGateway

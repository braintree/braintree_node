{Gateway} = require('./gateway')
{Address} = require('./address')
exceptions = require('./exceptions')

class AddressGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  create: (attributes, callback) ->
    customerId = attributes.customerId
    delete(attributes.customerId)
    @gateway.http.post("#{@config.baseMerchantPath}/customers/#{customerId}/addresses", {address: attributes}, @responseHandler(callback))

  delete: (customerId, id, callback) ->
    @gateway.http.delete("#{@config.baseMerchantPath}/customers/#{customerId}/addresses/#{id}", callback)

  find: (customerId, id, callback) ->
    if(customerId.trim() == '' || id.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.get "#{@config.baseMerchantPath}/customers/#{customerId}/addresses/#{id}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, response.address)

  update: (customerId, id, attributes, callback) ->
    @gateway.http.put("#{@config.baseMerchantPath}/customers/#{customerId}/addresses/#{id}", {address: attributes}, @responseHandler(callback))

  responseHandler: (callback) ->
    @createResponseHandler("address", Address, callback)

exports.AddressGateway = AddressGateway

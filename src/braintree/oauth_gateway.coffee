{Gateway} = require('./gateway')
{OAuthCredentials} = require('./oauth_credentials')
util = require('util')

exceptions = require('./exceptions')

class OAuthGateway extends Gateway
  constructor: (@gateway) ->

  createTokenFromCode: (attributes, callback) ->
    attributes.grantType = 'authorization_code'
    @gateway.http.post('/oauth/access_tokens', attributes, @responseHandler(callback))

  responseHandler: (callback) ->
    @createResponseHandler("credentials", OAuthCredentials, callback)

exports.OAuthGateway = OAuthGateway

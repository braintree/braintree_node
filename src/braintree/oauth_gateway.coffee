{Gateway} = require('./gateway')
{OAuthCredentials} = require('./oauth_credentials')
util = require('util')
{Util} = require('./util')
{Digest} = require('./digest')

exceptions = require('./exceptions')

class OAuthGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  createTokenFromCode: (attributes, callback) ->
    attributes.grantType = 'authorization_code'
    @gateway.http.post('/oauth/access_tokens', attributes, @responseHandler(callback))

  createTokenFromRefreshToken: (attributes, callback) ->
    attributes.grantType = 'refresh_token'
    @gateway.http.post('/oauth/access_tokens', attributes, @responseHandler(callback))

  responseHandler: (callback) ->
    @createResponseHandler("credentials", OAuthCredentials, callback)

  connectUrl: (params) ->
    url = @config.baseUrl() + '/oauth/connect?' + @buildQuery(params)
    signature = Digest.Sha256hexdigest(@config.clientSecret, url)
    url + "&signature=#{signature}&algorithm=SHA256"

  buildQuery: (params) ->
    query = Util.convertObjectKeysToUnderscores(params)
    query.client_id = @config.clientId
    @addSubQuery(query, 'user', query.user)
    @addSubQuery(query, 'business', query.business)
    delete query.user
    delete query.business

    queryParts = []
    for key, value of query
      queryParts.push("#{encodeURIComponent(key)}=#{encodeURIComponent(value)}")

    queryParts.join('&')

  addSubQuery: (query, key, subParams) ->
    for subKey, value of subParams
      query["#{key}[#{subKey}]"] = value

exports.OAuthGateway = OAuthGateway

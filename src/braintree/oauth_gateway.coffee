{Gateway} = require('./gateway')
{OAuthCredentials} = require('./oauth_credentials')
{AttributeSetter} = require('./attribute_setter')
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

  revokeAccessToken: (accessToken, callback) ->
    @gateway.http.post('/oauth/revoke_access_token', { token: accessToken }, @createResponseHandler("result", AttributeSetter, callback))

  responseHandler: (callback) ->
    @createResponseHandler("credentials", OAuthCredentials, callback)

  connectUrl: (params) ->
    params.clientId = @config.clientId
    url = @config.baseUrl() + '/oauth/connect?' + @buildQuery(params)
    signature = Digest.Sha256hexdigest(@config.clientSecret, url)
    url + "&signature=#{signature}&algorithm=SHA256"

  buildQuery: (params) ->
    params = Util.convertObjectKeysToUnderscores(params)

    paramsArray = @buildSubQuery('user', params.user)
    paramsArray.push(@buildSubQuery('business', params.business)...)
    paramsArray.push(@buildSubArrayQuery('payment_methods', params.payment_methods)...)
    delete params.user
    delete params.business
    delete params.payment_methods

    paramsArray.push(([key, val] for key, val of params)...)

    queryStringParts = paramsArray.map ([key, value]) =>
      "#{@_encodeValue(key)}=#{@_encodeValue(value)}"

    queryStringParts.join('&')

  buildSubQuery: (key, subParams) ->
    arr = []
    for subKey, value of subParams
      arr.push(["#{key}[#{subKey}]", value])

    arr

  buildSubArrayQuery: (key, values) ->
    (values || []).map (value) ->
      ["#{key}[]", value]

  _encodeValue: (value) ->
    encodeURIComponent(value)
      .replace(/[!'()]/g, escape)
      .replace(/\*/g, '%2A')

exports.OAuthGateway = OAuthGateway

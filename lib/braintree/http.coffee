sys = require('sys')
http = require('http')
https = require('https')
{Buffer} = require('buffer')

braintree = require('../braintree')
{XmlParser} = require('./xml_parser')
exceptions = require('./exceptions')
{Util} = require('./util')

Http = (config) ->
  my = { config: config }

  request = (method, url, body, callback) ->
    client = if my.config.environment.ssl then https else http
    options = {
      host: my.config.environment.server,
      port: my.config.environment.port,
      method: method,
      path: my.config.baseMerchantPath + url,
      headers: {
        'Authorization': (new Buffer(my.config.publicKey + ':' + my.config.privateKey)).toString('base64'),
        'X-ApiVersion': my.config.apiVersion,
        'Accept': 'application/xml',
        'Content-Type': 'application/json',
        'User-Agent': 'Braintree Node ' + braintree.version
      }
    }
    if body
      requestBody = JSON.stringify(Util.convertObjectKeysToUnderscores(body))
      options.headers['Content-Length'] = requestBody.length.toString()

    theRequest = client.request(options, (response) ->
      body = ''

      response.on('data', (responseBody) -> body += responseBody )

      response.on('end', ->
        error = checkHttpStatus(response.statusCode)
        return callback(error, null) if error
        if body isnt ' '
          callback(null, XmlParser.parse(body))
        else
          callback(null, null)
      )
    )
    theRequest.write(requestBody) if body
    theRequest.end()

  checkHttpStatus = (status) ->
    switch status.toString()
      when '200', '201', '422' then null
      when '401' then exceptions.AuthenticationError()
      when '403' then exceptions.AuthorizationError()
      when '404' then exceptions.NotFoundError()
      when '426' then exceptions.UpgradeRequired()
      when '500' then exceptions.ServerError()
      when '503' then exceptions.DownForMaintenanceError()
      else exceptions.UnexpectedError('Unexpected HTTP response: ' + status)

  {
    checkHttpStatus: checkHttpStatus,
    delete: (url, callback) -> request('DELETE', url, null, callback)
    get: (url, callback) -> request('GET', url, null, callback)
    post: (url, body, callback) -> request('POST', url, body, callback)
    put: (url, body, callback) -> request('PUT', url, body, callback)
  }

exports.Http = Http

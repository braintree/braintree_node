http = require('http')
https = require('https')
{Buffer} = require('buffer')

braintree = require('../braintree')
xml2js = require('xml2js')
exceptions = require('./exceptions')
{Util} = require('./util')

class Http
  timeout: 60000

  constructor: (@config) ->
    @parser = new xml2js.Parser
      explicitRoot: true

  checkHttpStatus: (status) ->
    switch status.toString()
      when '200', '201', '422' then null
      when '401' then exceptions.AuthenticationError("Authentication Error")
      when '403' then exceptions.AuthorizationError("Authorization Error")
      when '404' then exceptions.NotFoundError("Not Found")
      when '426' then exceptions.UpgradeRequired("Upgrade Required")
      when '500' then exceptions.ServerError("Server Error")
      when '503' then exceptions.DownForMaintenanceError("Down for Maintenance")
      else exceptions.UnexpectedError('Unexpected HTTP response: ' + status)

  delete: (url, callback) ->
    @request('DELETE', url, null, callback)

  get: (url, callback) ->
    @request('GET', url, null, callback)

  post: (url, body, callback) ->
    @request('POST', url, body, callback)

  put: (url, body, callback) ->
    @request('PUT', url, body, callback)

  request: (method, url, body, callback) ->
    client = if @config.environment.ssl then https else http

    options = {
      host: @config.environment.server,
      port: @config.environment.port,
      method: method,
      path: @config.baseMerchantPath + url,
      headers: {
        'Authorization': 'Basic ' + (new Buffer(@config.publicKey + ':' + @config.privateKey)).toString('base64'),
        'X-ApiVersion': @config.apiVersion,
        'Accept': 'application/xml',
        'Content-Type': 'application/json',
        'User-Agent': 'Braintree Node ' + braintree.version
      }
    }

    if body
      requestBody = JSON.stringify(Util.convertObjectKeysToUnderscores(body))
      options.headers['Content-Length'] = Buffer.byteLength(requestBody).toString()

    theRequest = client.request(options, (response) =>
      body = ''

      response.on('data', (responseBody) -> body += responseBody )

      response.on('end', =>
        error = @checkHttpStatus(response.statusCode)
        return callback(error, null) if error
        if body isnt ' '
          @parser.parseString body, (err, result) ->
            callback(null, Util.convertNodeToObject(result))
        else
          callback(null, null)
      )

      response.on('error', (err) ->
        error = exceptions.UnexpectedError('Unexpected response error: ' + err)
        return callback(error, null)
      )
    )

    theRequest.setTimeout(@timeout, ->
      error = exceptions.UnexpectedError("Request timed out")
      return callback(error, null)
    )

    theRequest.on('error', (err) ->
      error = exceptions.UnexpectedError('Unexpected request error: ' + err)
      return callback(error, null)
    )

    theRequest.write(requestBody) if body
    theRequest.end()

exports.Http = Http

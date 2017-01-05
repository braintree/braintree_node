http = require('http')
https = require('https')
{Buffer} = require('buffer')

braintree = require('../braintree')
xml2js = require('xml2js')
exceptions = require('./exceptions')
{Util} = require('./util')

class Http
  constructor: (@config) ->

  checkHttpStatus: (status) ->
    switch status.toString()
      when '200', '201', '422' then null
      when '401' then exceptions.AuthenticationError("Authentication Error")
      when '403' then exceptions.AuthorizationError("Authorization Error")
      when '404' then exceptions.NotFoundError("Not Found")
      when '426' then exceptions.UpgradeRequired("Upgrade Required")
      when '429' then exceptions.TooManyRequestsError("Too Many Requests")
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
      path: url,
      headers: {
        'Authorization': @authorizationHeader(),
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
          parser = new xml2js.Parser
            explicitRoot: true

          parser.parseString body, (err, result) ->
            if err
              callback(err, null)
            else
              callback(null, Util.convertNodeToObject(result))
        else
          callback(null, null)
      )

      response.on('error', (err) ->
        error = exceptions.UnexpectedError('Unexpected response error: ' + err)
        return callback(error, null)
      )
    )

    timeoutHandler = () =>
      theRequest.abort()
      @_aborted = true
      error = exceptions.UnexpectedError("Request timed out")
      return callback(error, null)

    theRequest.setTimeout(@config.timeout, timeoutHandler)

    requestSocket = null
    theRequest.on('socket', (socket) ->
      requestSocket = socket
    )

    theRequest.on('error', (err) =>
      return if @_aborted
      if @config.timeout > 0
        requestSocket.removeListener('timeout', timeoutHandler)
      error = exceptions.UnexpectedError('Unexpected request error: ' + err)
      return callback(error, null)
    )

    theRequest.write(requestBody) if body
    theRequest.end()

  authorizationHeader: ->
    if @config.accessToken
      'Bearer ' + @config.accessToken
    else if @config.clientId
      'Basic ' + (new Buffer(@config.clientId + ':' + @config.clientSecret)).toString('base64')
    else
      'Basic ' + (new Buffer(@config.publicKey + ':' + @config.privateKey)).toString('base64')

exports.Http = Http

class Environment
  DEVELOPMENT_PORT = process.env['GATEWAY_PORT'] || '3000'
  @Development = new Environment('localhost', DEVELOPMENT_PORT, "http://auth.venmo.dev:9292", false)
  @Sandbox = new Environment('api.sandbox.braintreegateway.com', '443', "https://auth.sandbox.venmo.com", true)
  @Production = new Environment('api.braintreegateway.com', '443', "https://auth.venmo.com", true)

  constructor: (@server, @port, @authUrl, @ssl) ->

  baseUrl: ->
    url = @uriScheme() + @server
    if @ is Environment.Development
      url += ":" + @port

    url

  uriScheme: -> if @ssl then "https://" else "http://"

exports.Environment = Environment

class Environment
  DEVELOPMENT_PORT = process.env['GATEWAY_PORT'] || '3000'
  @Development = new Environment('localhost', DEVELOPMENT_PORT, false)
  @Sandbox = new Environment('api.sandbox.braintreegateway.com', '443', true)
  @Production = new Environment('api.braintreegateway.com', '443', true)

  constructor: (@server, @port, @ssl) ->

  baseUrl: ->
    url = @uriScheme() + @server
    if @ is Environment.Development
      url += ":" + @port

    url

  uriScheme: -> if @ssl then "https://" else "http://"

exports.Environment = Environment

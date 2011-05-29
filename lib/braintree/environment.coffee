Environment = (server, port, ssl) ->
  {
    server: server,
    port: port,
    ssl: ssl
  }


developmentPort = process.env['GATEWAY_PORT'] || '3000'

Environment.Development = Environment('localhost', developmentPort, false)
Environment.Sandbox = Environment('sandbox.braintreegateway.com', '443', true)
Environment.Production = Environment('www.braintreegateway.com', '443', true)

exports.Environment = Environment

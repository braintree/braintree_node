var Environment = function (server, port, ssl) {
  return {
    server: server,
    port: port,
    ssl: ssl
  }
};

Environment.Development = Environment('localhost', '3000', false);
Environment.Sandbox = Environment('sandbox.braintreegateway.com', '443', true);
Environment.Production = Environment('www.braintreegateway.com', '443', true);

exports.Environment = Environment;

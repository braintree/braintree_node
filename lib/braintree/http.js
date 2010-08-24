var sys = require('sys'),
    http = require('http'),
    Buffer = require('buffer').Buffer,
    base64 = require('../vendor/base64.node'), // http://github.com/pkrumins/node-base64.git @ 10e79a13
    braintree = require('../braintree'),
    AuthenticationError = require('./exceptions/authentication_error').AuthenticationError,
    UnexpectedError = require('./exceptions/unexpected_error').UnexpectedError;

var Http = function (config) {
  var my = {
    config: config
  };

  return {
    post: function (url, body, callback) {
      var client = http.createClient(
        my.config.environment.port,
        my.config.environment.server,
        my.config.environment.ssl
      );
      var requestBody = JSON.stringify(body);
      var request = client.request('POST', my.config.baseMerchantPath + url, {
        'Content-Length': requestBody.length.toString(),
        'Authorization': base64.encode(new Buffer(my.config.public_key + ':' + my.config.private_key)),
        'X-ApiVersion': '2',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'client Node ' + braintree.version
      });
      request.write(requestBody);
      request.end();
      request.on('response', function (response) {
        var body = '';
        response.on('data', function (responseBody) {
          body += responseBody;
        });
        response.on('end', function () {
          if (response.statusCode == 401) {
            callback(AuthenticationError(), null);
          } else if (response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 422) {
            callback(null, JSON.parse(body));
          } else {
            callback(UnexpectedError('Unexpected HTTP response: ' + response.statusCode), null);
          }
        });
      });
    }
  };
};

exports.Http = Http;

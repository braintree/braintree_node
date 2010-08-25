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

  var request = function (method, url, body, callback) {
    var client = http.createClient(
      my.config.environment.port,
      my.config.environment.server,
      my.config.environment.ssl
    );
    var headers = {
      'Authorization': base64.encode(new Buffer(my.config.public_key + ':' + my.config.private_key)),
      'X-ApiVersion': '2',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'client Node ' + braintree.version
    };
    if (body) {
      var requestBody = JSON.stringify(body);
      headers['Content-Length'] = requestBody.length.toString();
    }
    var request = client.request(method, my.config.baseMerchantPath + url, headers);
    if (body) { request.write(requestBody); }
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
  };

  return {
    post: function (url, body, callback) {
      request('POST', url, body, callback);
    },

    put: function (url, body, callback) {
      request('PUT', url, body, callback);
    }
  };
};

exports.Http = Http;

var sys = require('sys'),
    http = require('http'),
    https = require('https'),
    Buffer = require('buffer').Buffer,
    braintree = require('../braintree'),
    XmlParser = require('./xml_parser').XmlParser,
    exceptions = require('./exceptions');

var Http = function (config) {

  var my = {
    config: config
  };

  var request = function (method, url, body, callback) {
    var client = my.config.environment.ssl ? https : http;
    var options = {
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
    };
    if (body) {
      var requestBody = JSON.stringify(body);
      options.headers['Content-Length'] = requestBody.length.toString();
    }
    var request = client.request(options, function (response) {
      var body = '';

      response.on('data', function (responseBody) {
        body += responseBody;
      });

      response.on('end', function () {
        var error = checkHttpStatus(response.statusCode);
        if (error) {
          return callback(error, null);
        }
        if (body !== ' ') {
          callback(null, XmlParser.parse(body));
        } else {
          callback(null, null);
        }
      });
    });
    if (body) { request.write(requestBody); }
    request.end();
  };

  var checkHttpStatus = function (status) {
    switch(status.toString()) {
      case '200':
      case '201':
      case '422':
        return null;
      case '401':
        return exceptions.AuthenticationError();
      case '403':
        return exceptions.AuthorizationError();
      case '404':
        return exceptions.NotFoundError()
      case '426':
        return exceptions.UpgradeRequired()
      case '500':
        return exceptions.ServerError()
      case '503':
        return exceptions.DownForMaintenanceError()
      default:
        return exceptions.UnexpectedError('Unexpected HTTP response: ' + status)
    }
  };

  return {
    checkHttpStatus: checkHttpStatus,

    delete: function (url, callback) {
      request('DELETE', url, null, callback);
    },

    get: function (url, callback) {
      request('GET', url, null, callback);
    },

    post: function (url, body, callback) {
      request('POST', url, body, callback);
    },

    put: function (url, body, callback) {
      request('PUT', url, body, callback);
    }
  };
};

exports.Http = Http;

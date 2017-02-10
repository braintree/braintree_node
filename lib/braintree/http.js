'use strict';

let http = require('http');
let https = require('https');
let Buffer = require('buffer').Buffer;

let version = require('../../package.json').version;
let xml2js = require('xml2js');
let exceptions = require('./exceptions');
let Util = require('./util').Util;

class Http {
  constructor(config) {
    this.config = config;
  }

  checkHttpStatus(status) {
    switch (status.toString()) {
      case '200':
      case '201':
      case '422': return null;
      case '401': return exceptions.AuthenticationError('Authentication Error'); // eslint-disable-line new-cap
      case '403': return exceptions.AuthorizationError('Authorization Error'); // eslint-disable-line new-cap
      case '404': return exceptions.NotFoundError('Not Found'); // eslint-disable-line new-cap
      case '426': return exceptions.UpgradeRequired('Upgrade Required'); // eslint-disable-line new-cap
      case '429': return exceptions.TooManyRequestsError('Too Many Requests'); // eslint-disable-line new-cap
      case '500': return exceptions.ServerError('Server Error'); // eslint-disable-line new-cap
      case '503': return exceptions.DownForMaintenanceError('Down for Maintenance'); // eslint-disable-line new-cap
      default: return exceptions.UnexpectedError(`Unexpected HTTP response: ${status}`); // eslint-disable-line new-cap
    }
  }

  delete(url, callback) {
    return this.request('DELETE', url, null, callback);
  }

  get(url, callback) {
    return this.request('GET', url, null, callback);
  }

  post(url, body, callback) {
    return this.request('POST', url, body, callback);
  }

  put(url, body, callback) {
    return this.request('PUT', url, body, callback);
  }

  request(method, url, body, callback) {
    let requestBody;
    let client = this.config.environment.ssl ? https : http;

    let options = {
      host: this.config.environment.server,
      port: this.config.environment.port,
      method,
      path: url,
      headers: {
        Authorization: this.authorizationHeader(),
        'X-ApiVersion': this.config.apiVersion,
        Accept: 'application/xml',
        'Content-Type': 'application/json',
        'User-Agent': `Braintree Node ${version}`
      }
    };

    if (body) {
      requestBody = JSON.stringify(Util.convertObjectKeysToUnderscores(body));

      options.headers['Content-Length'] = Buffer.byteLength(requestBody).toString();
    }

    let theRequest = client.request(options, response => {
      body = '';

      response.on('data', (responseBody) => {
        body += responseBody;
      });

      response.on('end', () => {
        let parser;
        let error = this.checkHttpStatus(response.statusCode);

        if (error) {
          callback(error, null);
          return;
        }
        if (body !== ' ') {
          parser = new xml2js.Parser({
            explicitRoot: true
          });

          parser.parseString(body, (err, result) => {
            if (err) {
              callback(err);
            } else {
              callback(null, Util.convertNodeToObject(result));
            }
          });
        } else {
          callback(null, null);
        }
      });

      response.on('error', function (err) {
        let error = exceptions.UnexpectedError(`Unexpected response error: ${err}`); // eslint-disable-line new-cap

        callback(error, null);
      });
    });

    let timeoutHandler = () => {
      theRequest.abort();
      this._aborted = true;
      let error = exceptions.UnexpectedError('Request timed out'); // eslint-disable-line new-cap

      callback(error, null);
    };

    theRequest.setTimeout(this.config.timeout, timeoutHandler);

    let requestSocket = null;

    theRequest.on('socket', (socket) => {
      requestSocket = socket;
    });

    theRequest.on('error', err => {
      if (this._aborted) { return; }
      if (this.config.timeout > 0) {
        requestSocket.removeListener('timeout', timeoutHandler);
      }
      let error = exceptions.UnexpectedError(`Unexpected request error: ${err}`); // eslint-disable-line new-cap

      callback(error, null);
    });

    if (body) { theRequest.write(requestBody); }
    return theRequest.end();
  }

  authorizationHeader() {
    if (this.config.accessToken) {
      return `Bearer ${this.config.accessToken}`;
    } else if (this.config.clientId) {
      return `Basic ${(new Buffer(this.config.clientId + ':' + this.config.clientSecret)).toString('base64')}`;
    }

    return `Basic ${(new Buffer(this.config.publicKey + ':' + this.config.privateKey)).toString('base64')}`;
  }
}

module.exports = {Http: Http};

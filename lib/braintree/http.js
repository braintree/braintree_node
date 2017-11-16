'use strict';

let http = require('http');
let https = require('https');
let zlib = require('zlib');
let Buffer = require('buffer').Buffer;
let fs = require('fs');
let path = require('path');

let version = require('../../package.json').version;
let xml2js = require('xml2js');
let exceptions = require('./exceptions');
let Util = require('./util').Util;
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

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

  delete(url) {
    return this.request('DELETE', url, null);
  }

  get(url) {
    return this.request('GET', url, null);
  }

  post(url, body) {
    return this.request('POST', url, body);
  }

  postMultipart(url, body, file) {
    return this.request('POST', url, body, file);
  }

  put(url, body) {
    return this.request('PUT', url, body);
  }

  request(method, url, body, file) {
    let boundary, requestBody, requestAborted;
    let client = this.config.environment.ssl ? https : http;

    let options = {
      host: this.config.environment.server,
      port: this.config.environment.port,
      method,
      path: url,
      headers: this._headers()
    };

    if (file) {
      boundary = 'boundary' + Date.now();
      requestBody = this._prepareMultipart(boundary, body, file);
      options.headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
    } else if (body) {
      requestBody = JSON.stringify(Util.convertObjectKeysToUnderscores(body));
    }

    if (requestBody) {
      options.headers['Content-Length'] = Buffer.byteLength(requestBody).toString();
    }

    return new Promise((resolve, reject) => {
      let theRequest = client.request(options, (response) => {
        let chunks = [];

        response.on('data', (responseBody) => {
          chunks.push(responseBody);
        });

        response.on('end', () => {
          let buffer = Buffer.concat(chunks);
          let error = this.checkHttpStatus(response.statusCode);

          if (error) {
            reject(error);
            return;
          }

          if (buffer.length > 0) {
            if (response.headers['content-encoding'] === 'gzip') {
              zlib.gunzip(buffer, (gunzipError, result) => {
                if (gunzipError) {
                  reject(gunzipError);
                } else {
                  parseResponse(result.toString('utf8'));
                }
              });
            } else {
              parseResponse(buffer.toString('utf8'));
            }
          } else {
            resolve();
          }
        });

        response.on('error', function (err) {
          let error = exceptions.UnexpectedError(`Unexpected response error: ${err}`); // eslint-disable-line new-cap

          reject(error);
        });
      });

      function parseResponse(responseBody) {
        if (responseBody.match(/^\s+$/)) {
          resolve({});
        } else {
          new xml2js.Parser({
            explicitRoot: true
          }).parseString(responseBody, (err, result) => {
            if (err) {
              reject(err);
            } else if (result) {
              resolve(Util.convertNodeToObject(result));
            }
          });
        }
      }

      function timeoutHandler() {
        theRequest.abort();
        requestAborted = true;
        let error = exceptions.UnexpectedError('Request timed out'); // eslint-disable-line new-cap

        reject(error);
      }

      theRequest.setTimeout(this.config.timeout, timeoutHandler);

      let requestSocket;

      theRequest.on('socket', (socket) => {
        requestSocket = socket;
      });

      theRequest.on('error', err => {
        if (requestAborted) { return; }
        if (this.config.timeout > 0) {
          requestSocket.removeListener('timeout', timeoutHandler);
        }
        let error = exceptions.UnexpectedError(`Unexpected request error: ${err}`); // eslint-disable-line new-cap

        reject(error);
      });

      if (body) { theRequest.write(requestBody); }
      theRequest.end();
    });
  }

  _prepareMultipart(boundary, body, file) {
    let val;
    let requestBody = '';

    requestBody += this._filePart('file', file, boundary);
    for (const key of Object.keys(body)) {
      val = body[key];

      requestBody += this._formPart(key, val, boundary);
    }

    requestBody += `--${boundary}--`;
    requestBody += '\r\n\r\n';

    return requestBody;
  }

  _partHeader(key, filename, boundary) {
    let part = `--${boundary}`;

    part += '\r\n';
    part += `Content-Disposition: form-data; name="${key}"`;
    if (filename) {
      part += `; filename="${filename}"`;
      part += '\r\n';
      part += `Content-Type: ${this._filetype(filename)}`;
    }
    part += '\r\n\r\n';

    return part;
  }

  _formPart(key, formPart, boundary) {
    let part = this._partHeader(key, null, boundary);

    part += formPart;
    part += '\r\n';

    return part;
  }

  _filePart(key, readStream, boundary) {
    let part = this._partHeader(key, path.basename(readStream.path), boundary);

    let fileData = fs.readFileSync(readStream.path);

    part += fileData;
    part += '\r\n';

    return part;
  }

  _filetype(filename) {
    let ext = path.extname(filename);

    if (ext === '.jpeg' || ext === '.jpg') {
      return 'image/jpeg';
    } else if (ext === '.png') {
      return 'image/png';
    } else if (ext === '.pdf') {
      return 'application/pdf';
    }

    return 'application/octet-stream';
  }

  _headers() {
    return {
      Authorization: this.authorizationHeader(),
      'X-ApiVersion': this.config.apiVersion,
      Accept: 'application/xml',
      'Content-Type': 'application/json',
      'User-Agent': `Braintree Node ${version}`,
      'Accept-Encoding': 'gzip'
    };
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

module.exports = {Http: wrapPrototype(Http)};

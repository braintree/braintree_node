"use strict";
/* eslint-disable new-cap */

let http = require("http");
let https = require("https");
let zlib = require("zlib");
let Buffer = require("buffer").Buffer;
let fs = require("fs");
let path = require("path");

let version = require("../../package.json").version;
let xml2js = require("xml2js");
let exceptions = require("./exceptions");
let Util = require("./util").Util;
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class Http {
  constructor(config) {
    this.config = config;
  }

  checkHttpStatus(status) {
    switch (status.toString()) {
      case "200":
      case "201":
      case "422":
        return null;
      case "401":
        return exceptions.AuthenticationError("Authentication Error");
      case "403":
        return exceptions.AuthorizationError("Authorization Error");
      case "404":
        return exceptions.NotFoundError("Not Found");
      case "408":
        return exceptions.RequestTimeoutError("Request Timeout Error");
      case "426":
        return exceptions.UpgradeRequired("Upgrade Required");
      case "429":
        return exceptions.TooManyRequestsError("Too Many Requests");
      case "500":
        return exceptions.ServerError("Server Error");
      case "503":
        return exceptions.ServiceUnavailableError("Service Unavailable Error");
      case "504":
        return exceptions.GatewayTimeoutError("Gateway Timeout Error");
      default:
        return exceptions.UnexpectedError(
          `Unexpected HTTP response: ${status}`
        );
    }
  }

  delete(url) {
    return this.httpRequest("DELETE", url, null);
  }

  get(url) {
    return this.httpRequest("GET", url, null);
  }

  post(url, body) {
    return this.httpRequest("POST", url, body);
  }

  postMultipart(url, body, file) {
    return this.httpRequest("POST", url, body, file);
  }

  put(url, body) {
    return this.httpRequest("PUT", url, body);
  }

  httpRequest(method, url, body, file, host, port, headers) {
    let boundary, requestBody, requestAborted;
    let client = this.config.environment.ssl ? https : http;

    let options = {
      host: host || this.config.environment.server,
      port: port || this.config.environment.port,
      method,
      path: url,
      headers: Object.assign({}, this._headers(), headers),
    };

    if (this.config.customHttpAgent) {
      options.agent = this.config.customHttpAgent;
    }

    if (file) {
      boundary = "boundary" + Date.now();
      requestBody = this._prepareMultipart(boundary, body, file);
      options.headers[
        "Content-Type"
      ] = `multipart/form-data; boundary=${boundary}`;
    } else if (body) {
      if ("application/json".match(options.headers.Accept)) {
        requestBody = JSON.stringify(body);
      } else {
        requestBody = JSON.stringify(Util.convertObjectKeysToUnderscores(body));
      }
    }

    if (requestBody) {
      options.headers["Content-Length"] =
        Buffer.byteLength(requestBody).toString();
    }

    return new Promise((resolve, reject) => {
      let theRequest = client.request(options, (response) => {
        let chunks = [];

        response.on("data", (responseBody) => {
          chunks.push(responseBody);
        });

        response.on("end", () => {
          let buffer = Buffer.concat(chunks);
          let error = this.checkHttpStatus(response.statusCode);

          if (error) {
            reject(error);

            return;
          }

          if (buffer.length > 0) {
            if (response.headers["content-encoding"] === "gzip") {
              zlib.gunzip(buffer, (gunzipError, result) => {
                if (gunzipError) {
                  reject(gunzipError);
                } else {
                  parseResponse(
                    result.toString("utf8"),
                    response.headers["content-type"]
                  );
                }
              });
            } else {
              parseResponse(
                buffer.toString("utf8"),
                response.headers["content-type"]
              );
            }
          } else {
            resolve();
          }
        });

        response.on("error", function (err) {
          let error = exceptions.UnexpectedError(
            `Unexpected response error: ${err}`
          );

          reject(error);
        });
      });

      function parseResponse(responseBody, contentType) {
        if (responseBody.match(/^\s+$/)) {
          resolve({});
        } else if (contentType && contentType.match("application/xml")) {
          xml2js
            .parseStringPromise(responseBody, {
              attrkey: "@",
              charkey: "#",
              explicitArray: false,
            })
            .then((result) => {
              resolve(Util.convertNodeToObject(result));
            })
            .catch(reject);
        } else if (contentType && contentType.match("application/json")) {
          resolve(JSON.parse(responseBody));
        } else {
          resolve(responseBody);
        }
      }

      function timeoutHandler() {
        theRequest.abort();
        requestAborted = true;
        let error = exceptions.UnexpectedError("Request timed out");

        reject(error);
      }

      theRequest.setTimeout(this.config.timeout, timeoutHandler);

      let requestSocket;

      theRequest.on("socket", (socket) => {
        requestSocket = socket;
      });

      theRequest.on("error", (err) => {
        if (requestAborted) {
          return;
        }
        if (this.config.timeout > 0 && requestSocket) {
          requestSocket.removeListener("timeout", timeoutHandler);
        }
        let error = exceptions.UnexpectedError(
          `Unexpected request error: ${err}`
        );

        reject(error);
      });

      if (body) {
        theRequest.write(requestBody);
      }
      theRequest.end();
    });
  }

  _prepareMultipart(boundary, body, file) {
    let requestBody = Buffer.concat([this._filePart("file", file, boundary)]);

    for (const key of Object.keys(body)) {
      let val = body[key];

      requestBody = Buffer.concat([
        requestBody,
        this._formPart(key, val, boundary),
      ]);
    }

    return Buffer.concat([requestBody, Buffer.from(`--${boundary}--\r\n\r\n`)]);
  }

  _partHeader(key, filename, boundary) {
    let part = `--${boundary}`;

    part += "\r\n";
    part += `Content-Disposition: form-data; name="${key}"`;
    if (filename) {
      part += `; filename="${filename}"`;
      part += "\r\n";
      part += `Content-Type: ${this._filetype(filename)}`;
    }
    part += "\r\n\r\n";

    return part;
  }

  _formPart(key, formPart, boundary) {
    return Buffer.concat([
      Buffer.from(this._partHeader(key, null, boundary)),
      Buffer.from(formPart + "\r\n"),
    ]);
  }

  _filePart(key, readStream, boundary) {
    let part = Buffer.from(
      this._partHeader(key, path.basename(readStream.path), boundary)
    );
    let fileData = fs.readFileSync(readStream.path);

    return Buffer.concat([part, fileData, Buffer.from("\r\n")]);
  }

  _filetype(filename) {
    let ext = path.extname(filename);

    if (ext === ".jpeg" || ext === ".jpg") {
      return "image/jpeg";
    } else if (ext === ".png") {
      return "image/png";
    } else if (ext === ".pdf") {
      return "application/pdf";
    }

    return "application/octet-stream";
  }

  _headers() {
    return {
      Authorization: this.authorizationHeader(),
      "X-ApiVersion": this.config.apiVersion,
      Accept: "application/xml",
      "Content-Type": "application/json",
      "User-Agent": `Braintree Node ${version}`,
      "Accept-Encoding": "gzip",
    };
  }

  authorizationHeader() {
    if (this.config.accessToken) {
      return `Bearer ${this.config.accessToken}`;
    } else if (this.config.clientId) {
      return `Basic ${Buffer.from(
        this.config.clientId + ":" + this.config.clientSecret
      ).toString("base64")}`;
    }

    return `Basic ${Buffer.from(
      this.config.publicKey + ":" + this.config.privateKey
    ).toString("base64")}`;
  }
}

module.exports = { Http: wrapPrototype(Http) };

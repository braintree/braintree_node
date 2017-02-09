'use strict';

let xml2js = require('xml2js');
let _ = require('underscore');
let Digest = require('./digest').Digest;
let Gateway = require('./gateway').Gateway;
let exceptions = require('./exceptions');
let Util = require('./util').Util;
let WebhookNotification = require('./webhook_notification').WebhookNotification;

class WebhookNotificationGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  parse(signature, payload, callback) {
    if (payload.match(/[^A-Za-z0-9+=\/\n]/)) {
      callback(exceptions.InvalidSignatureError('payload contains illegal characters'), null); // eslint-disable-line new-cap
      return;
    }
    let err = this.validateSignature(signature, payload);

    if (err) {
      callback(err, null);
      return;
    }

    let xmlPayload = new Buffer(payload, 'base64').toString('utf8');
    let parser = new xml2js.Parser({
      explicitRoot: true
    });

    parser.parseString(xmlPayload, (parseError, result) => {
      if (parseError) {
        callback(parseError);
      } else {
        let attributes = Util.convertNodeToObject(result);
        let handler = this.createResponseHandler('notification', WebhookNotification, (responseHandlerErr, responseHandlerResponse) => {
          callback(null, responseHandlerResponse.notification);
        });

        handler(null, attributes);
      }
    });
  }

  validateSignature(signatureString, payload) {
    let signaturePairs = signatureString.split('&').filter((pair) => pair.indexOf('|') !== -1).map((pair) => pair.split('|'));
    let signature = this.matchingSignature(signaturePairs);

    if (!signature) {
      return exceptions.InvalidSignatureError('no matching public key'); // eslint-disable-line new-cap
    }

    let self = this;
    let matches = _.some([payload, payload + '\n'], (data) => {
      return Digest.secureCompare(signature, Digest.Sha1hexdigest(self.gateway.config.privateKey, data));
    });

    if (!matches) {
      return exceptions.InvalidSignatureError('signature does not match payload - one has been modified'); // eslint-disable-line new-cap
    }
    return null;
  }

  verify(challenge, callback) {
    if (!challenge.match(/^[a-f0-9]{20,32}$/)) {
      if (callback != null) {
        callback(exceptions.InvalidChallengeError('challenge contains non-hex characters'), null); // eslint-disable-line new-cap
        return;
      }

      throw exceptions.InvalidChallengeError('challenge contains non-hex characters'); // eslint-disable-line new-cap
    }
    let digest = Digest.Sha1hexdigest(this.gateway.config.privateKey, challenge);

    return `${this.gateway.config.publicKey}|${digest}`; // eslint-disable-line consistent-return
  }

  matchingSignature(signaturePairs) {
    for (let keyPair of signaturePairs) {
      let publicKey = keyPair[0];
      let signature = keyPair[1];

      if (this.gateway.config.publicKey === publicKey) {
        return signature;
      }
    }
    return null;
  }
}

module.exports = {WebhookNotificationGateway: WebhookNotificationGateway};

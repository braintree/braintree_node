"use strict";
/* eslint-disable new-cap */

let xml2js = require("xml2js");
let Digest = require("./digest").Digest;
let Gateway = require("./gateway").Gateway;
let exceptions = require("./exceptions");
let Util = require("./util").Util;
let WebhookNotification = require("./webhook_notification").WebhookNotification;
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class WebhookNotificationGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  parse(signature, payload) {
    if (!signature) {
      return Promise.reject(
        exceptions.InvalidSignatureError("signature parameter is required")
      );
    }
    if (!payload) {
      return Promise.reject(
        exceptions.InvalidSignatureError("payload parameter is required")
      );
    }
    if (payload.match(/[^A-Za-z0-9+=\/\n]/)) {
      return Promise.reject(
        exceptions.InvalidSignatureError("payload contains illegal characters")
      );
    }
    let err = this.validateSignature(signature, payload);

    if (err) {
      return Promise.reject(err);
    }

    const xmlPayload = Buffer.from(payload, "base64").toString("utf8");

    return xml2js
      .parseStringPromise(xmlPayload, {
        attrkey: "@",
        charkey: "#",
        explicitArray: false,
      })
      .then((result) => {
        const attributes = Util.convertNodeToObject(result);
        const handler = this.createResponseHandler(
          "notification",
          WebhookNotification
        );

        return handler(attributes);
      })
      .then((responseHandlerResponse) => {
        return responseHandlerResponse.notification;
      });
  }

  validateSignature(signatureString, payload) {
    let signaturePairs = signatureString
      .split("&")
      .filter((pair) => pair.indexOf("|") !== -1)
      .map((pair) => pair.split("|"));
    let signature = this.matchingSignature(signaturePairs);

    if (!signature) {
      return exceptions.InvalidSignatureError("no matching public key");
    }

    let self = this;
    const matches = [payload, `${payload}\n`].some((data) =>
      Digest.secureCompare(
        signature,
        Digest.Sha1hexdigest(self.gateway.config.privateKey, data)
      )
    );

    if (!matches) {
      return exceptions.InvalidSignatureError(
        "signature does not match payload - one has been modified"
      );
    }

    return null;
  }

  verify(challenge, callback) {
    if (!challenge.match(/^[a-f0-9]{20,32}$/)) {
      if (callback != null) {
        callback(
          exceptions.InvalidChallengeError(
            "challenge contains non-hex characters"
          ),
          null
        );

        return;
      }

      throw exceptions.InvalidChallengeError(
        "challenge contains non-hex characters"
      );
    }
    let digest = Digest.Sha1hexdigest(
      this.gateway.config.privateKey,
      challenge
    );

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

module.exports = {
  WebhookNotificationGateway: wrapPrototype(WebhookNotificationGateway, {
    ignoreMethods: ["verify"],
  }),
};

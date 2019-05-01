'use strict';

let crypto = require('crypto');
let _ = require('underscore');

class Digest {
  static Sha1hexdigest(privateKey, string) {
    return new Digest().hmacSha1(privateKey, string);
  }

  static secureCompare(left, right) {
    return new Digest().secureCompare(left, right);
  }

  hmacSha256(key, data) {
    let hmac = crypto.createHmac('sha256', this.sha256(key));

    hmac.update(data, 'binary');

    return hmac.digest('hex');
  }

  hmacSha1(key, data) {
    let hmac = crypto.createHmac('sha1', this.sha1(key));

    hmac.update(data, 'binary');

    return hmac.digest('hex');
  }

  secureCompare(left, right) {
    if (left == null || right == null) { return false; }

    let leftBytes = this.unpack(left);
    let rightBytes = this.unpack(right);

    let result = 0;

    for (let bytePair of _.zip(leftBytes, rightBytes)) {
      let leftByte = bytePair[0];
      let rightByte = bytePair[1];

      result |= leftByte ^ rightByte;
    }

    return result === 0;
  }

  sha1(data) {
    let hash = crypto.createHash('sha1');

    hash.update(data, 'binary');

    return hash.digest();
  }

  sha256(data) {
    let hash = crypto.createHash('sha256');

    hash.update(data, 'binary');

    return hash.digest();
  }

  unpack(string) {
    let bytes = [];

    for (let index = 0; index < string.length; index++) {
      bytes.push(string.charCodeAt(index));
    }

    return bytes;
  }
}

module.exports = {Digest: Digest};

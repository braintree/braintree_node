var sys = require('sys'),
    crypto = require('crypto');

var Digest = function () {

  var sha1 = function (data) {
    var hash = crypto.createHash('sha1');
    hash.update(data);
    return hash.digest();
  };

  var hmacSha1 = function (key, data) {
    var hmac = crypto.createHmac('SHA1', sha1(key))
    hmac.update(data);
    return hmac.digest('hex');
  };

  return {
    hmacSha1: hmacSha1
  }
};

Digest.hexdigest = function (privateKey, string) {
  return Digest().hmacSha1(privateKey, string);
};

exports.Digest = Digest;

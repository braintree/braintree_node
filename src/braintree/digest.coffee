crypto = require('crypto')
_ = require('underscore')

class Digest
  @hexdigest: (privateKey, string) ->
    new Digest().hmacSha1(privateKey, string)

  @secureCompare: (left, right) ->
    new Digest().secureCompare(left, right)

  hmacSha1: (key, data) ->
    hmac = crypto.createHmac('sha1', @sha1(key))
    hmac.update(data)
    hmac.digest('hex')

  secureCompare: (left, right) ->
    return false unless left? and right?

    left_bytes = @unpack(left)
    right_bytes = @unpack(right)

    result = 0
    for [left_byte, right_byte] in _.zip(left_bytes, right_bytes)
      result |= left_byte ^ right_byte

    result == 0

  sha1: (data) ->
    hash = crypto.createHash('sha1')
    hash.update(data)
    hash.digest()

  unpack: (string) ->
    bytes = []
    for character, index in string
      bytes.push string.charCodeAt(index)
    bytes

exports.Digest = Digest
